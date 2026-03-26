import {
  ExplainResponse,
  FanResponse,
  HistoricalPricesResponse,
  NewsArticle,
  NewsResponse,
  PredictionComparisonResponse,
  PredictionResponse,
} from "../types/api";

const BASE_API_URL = import.meta.env.VITE_API_BASE_URL as string;
const PREDICTION_API_URL = `${BASE_API_URL}/predict`;
const FAN_API_URL = `${BASE_API_URL}/predictions/fan`;
const COMPARE_API_URL = `${BASE_API_URL}/predictions/compare`;
const HISTORICAL_API_URL = `${BASE_API_URL}/historical/prices`;
const NEWS_API_URL = `${BASE_API_URL}/news`;
const UPLOAD_EXCEL_API_URL = `${BASE_API_URL}/predict/upload-excel`;
const UPLOAD_EXCEL_TEMPLATE_URL = `${BASE_API_URL}/predict/upload-excel/template`;
const EXPLAIN_API_URL = `${BASE_API_URL}/explain`;
const DEFAULT_HISTORICAL_PAGE_LIMIT = 500;
const EMPTY_DATE_RANGE = { start: "", end: "" };

const normalizeDateOnly = (dateString: string): string =>
  dateString.includes("T") ? dateString.split("T")[0] : dateString;

const toFiniteNumberOrNull = (value: unknown): number | null => {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return null;

    const parsed = Number(trimmed);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
};

const toFiniteNumberOrDefault = (value: unknown, fallback = 0): number =>
  toFiniteNumberOrNull(value) ?? fallback;

const toIntegerOrZero = (value: unknown): number => {
  const parsed = toFiniteNumberOrNull(value);
  return parsed === null ? 0 : Math.trunc(parsed);
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const toStringOrNull = (value: unknown): string | null =>
  typeof value === "string" && value.trim().length > 0 ? value : null;

const toStringOrDefault = (value: unknown, fallback = ""): string =>
  toStringOrNull(value) ?? fallback;

const unwrapRecordPayload = (
  payload: unknown,
): { root: Record<string, unknown>; response: Record<string, unknown> } => {
  const root = isRecord(payload) ? payload : {};
  const nested = root.data;
  const response = isRecord(nested) && !Array.isArray(nested) ? nested : root;
  return { root, response };
};

const resolveSuccessFlag = (
  root: Record<string, unknown>,
  response: Record<string, unknown>,
): boolean => {
  if (typeof root.success === "boolean") {
    return root.success;
  }

  if (typeof response.success === "boolean") {
    return response.success;
  }

  return true;
};

const normalizePredictionResponse = (payload: unknown): PredictionResponse => {
  const { root, response } = unwrapRecordPayload(payload);
  const rawForecasts = Array.isArray(response.forecasts) ? response.forecasts : [];
  const success = resolveSuccessFlag(root, response);

  const forecasts = rawForecasts
    .map((item, index) => {
      const forecast = isRecord(item) ? item : {};
      const date = toStringOrDefault(forecast.date);

      if (!date) return null;

      return {
        date,
        forecasted_price: toFiniteNumberOrDefault(forecast.forecasted_price),
        forecasted_return: toFiniteNumberOrDefault(forecast.forecasted_return),
        horizon: toIntegerOrZero(forecast.horizon) || index + 1,
      };
    })
    .filter((forecast): forecast is PredictionResponse["forecasts"][number] => forecast !== null);

  return {
    success,
    data_source: toStringOrDefault(response.data_source, "unknown"),
    last_price_date: toStringOrDefault(response.last_price_date),
    last_price: toFiniteNumberOrDefault(response.last_price),
    forecasts,
    market_state: toStringOrDefault(response.market_state, "UNKNOWN"),
    is_market_open:
      typeof response.is_market_open === "boolean" ? response.is_market_open : false,
    market_open_time: toStringOrNull(response.market_open_time) ?? undefined,
    market_close_time: toStringOrNull(response.market_close_time) ?? undefined,
    timezone_info: toStringOrNull(response.timezone_info) ?? undefined,
  };
};

const normalizeFanResponse = (payload: unknown): FanResponse => {
  const { root, response } = unwrapRecordPayload(payload);
  const lastPrice = toFiniteNumberOrDefault(response.last_price);
  const rawFan = Array.isArray(response.fan) ? response.fan : [];

  const fan = rawFan
    .map((item) => {
      const row = isRecord(item) ? item : {};
      const date = toStringOrDefault(row.date);
      if (!date) return null;

      const pointForecast = toFiniteNumberOrDefault(row.point_forecast, lastPrice);

      return {
        date,
        point_forecast: pointForecast,
        p10: toFiniteNumberOrDefault(row.p10, pointForecast),
        p25: toFiniteNumberOrDefault(row.p25, pointForecast),
        p50: toFiniteNumberOrDefault(row.p50, pointForecast),
        p75: toFiniteNumberOrDefault(row.p75, pointForecast),
        p90: toFiniteNumberOrDefault(row.p90, pointForecast),
        sample_count: toIntegerOrZero(row.sample_count),
      };
    })
    .filter((point): point is FanResponse["fan"][number] => point !== null);

  return {
    success: resolveSuccessFlag(root, response),
    last_price_date: toStringOrDefault(response.last_price_date),
    last_price: lastPrice,
    fan,
  };
};

const normalizeHistoricalRow = (item: unknown): HistoricalPricesResponse["data"][number] | null => {
  const row = isRecord(item) ? item : {};
  const date = toStringOrDefault(row.date);

  if (!date) return null;

  const price = toFiniteNumberOrDefault(row.price);
  const open = toFiniteNumberOrDefault(row.open, price);
  const highBase = Math.max(price, open);
  const lowBase = Math.min(price, open);

  return {
    date,
    price,
    open,
    high: toFiniteNumberOrDefault(row.high, highBase),
    low: toFiniteNumberOrDefault(row.low, lowBase),
    volume: toFiniteNumberOrNull(row.volume),
    change_pct: toFiniteNumberOrDefault(row.change_pct),
    source: toStringOrDefault(row.source, "unknown"),
  };
};

const normalizeHistoricalResponse = (
  payload: unknown,
  fallbackLimit = DEFAULT_HISTORICAL_PAGE_LIMIT,
): HistoricalPricesResponse => {
  const { root, response } = unwrapRecordPayload(payload);
  const rawDateRange = isRecord(response.date_range) ? response.date_range : {};
  const data = (Array.isArray(response.data) ? response.data : [])
    .map((item) => normalizeHistoricalRow(item))
    .filter((row): row is HistoricalPricesResponse["data"][number] => row !== null);

  const normalizedDateRange = {
    start:
      toStringOrDefault(rawDateRange.start) ||
      (data.length > 0 ? normalizeDateOnly(data[0].date) : EMPTY_DATE_RANGE.start),
    end:
      toStringOrDefault(rawDateRange.end) ||
      (data.length > 0 ? normalizeDateOnly(data[data.length - 1].date) : EMPTY_DATE_RANGE.end),
  };

  return {
    success: resolveSuccessFlag(root, response),
    granularity: toStringOrDefault(response.granularity, "daily"),
    total_available: toIntegerOrZero(response.total_available) || data.length,
    total_records: toIntegerOrZero(response.total_records) || data.length,
    limit: toIntegerOrZero(response.limit) || fallbackLimit,
    offset: toIntegerOrZero(response.offset),
    date_range: normalizedDateRange,
    data,
  };
};

const fetchJson = async <T>(url: string): Promise<T> => {
  const response = await fetch(url, {
    cache: "no-store",
    headers: {
      "Cache-Control": "no-cache",
      Pragma: "no-cache",
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
};

const PREDICTION_CACHE_TTL_MS = 5 * 60 * 1000;

interface PredictionCacheEntry {
  data: PredictionResponse;
  timestamp: number;
}

let predictionCacheEntry: PredictionCacheEntry | null = null;
let predictionInFlightRequest: Promise<PredictionResponse> | null = null;

const getFreshPredictionCacheEntry = (): PredictionCacheEntry | null => {
  if (!predictionCacheEntry) return null;
  if (Date.now() - predictionCacheEntry.timestamp > PREDICTION_CACHE_TTL_MS) {
    predictionCacheEntry = null;
    return null;
  }
  return predictionCacheEntry;
};

export const getCachedPrediction = (): PredictionResponse | null =>
  getFreshPredictionCacheEntry()?.data ?? null;

export const clearPredictionCache = (): void => {
  predictionCacheEntry = null;
  predictionInFlightRequest = null;
};

export const fetchPredictions = async (
  requestOptions?: { forceRefresh?: boolean },
): Promise<PredictionResponse> => {
  const useCache = !requestOptions?.forceRefresh;

  if (useCache) {
    const cached = getFreshPredictionCacheEntry();
    if (cached) return cached.data;

    if (predictionInFlightRequest) return predictionInFlightRequest;
  }

  const request = fetchJson<unknown>(PREDICTION_API_URL)
    .then((payload) => normalizePredictionResponse(payload))
    .then((result) => {
      predictionCacheEntry = { data: result, timestamp: Date.now() };
      return result;
    })
    .finally(() => {
      predictionInFlightRequest = null;
    });

  predictionInFlightRequest = request;
  return request;
};

export const fetchFanPredictions = async (): Promise<FanResponse> =>
  normalizeFanResponse(await fetchJson<unknown>(FAN_API_URL));

const normalizePredictionComparisonResponse = (
  payload: unknown,
): PredictionComparisonResponse => {
  const { root, response } = unwrapRecordPayload(payload);
  const rawMetrics = isRecord(response.metrics) ? response.metrics : {};
  const rawComparison = Array.isArray(response.comparison)
    ? response.comparison
    : [];

  const comparison = rawComparison
    .map((item) => {
      const row = isRecord(item) ? item : {};

      return {
        date: toStringOrNull(row.date) ?? "",
        actual_price: toFiniteNumberOrNull(row.actual_price),
        predicted_price: toFiniteNumberOrNull(row.predicted_price),
        predicted_price_median: toFiniteNumberOrNull(row.predicted_price_median),
        predicted_price_latest: toFiniteNumberOrNull(row.predicted_price_latest),
        prediction_count: toIntegerOrZero(row.prediction_count),
        error: toFiniteNumberOrNull(row.error),
        abs_error: toFiniteNumberOrNull(row.abs_error),
        abs_pct_error: toFiniteNumberOrNull(row.abs_pct_error),
      };
    })
    .filter((row) => row.date.length > 0);

  const comparedDays = toFiniteNumberOrNull(rawMetrics.compared_days);
  const totalDaysReturned = toIntegerOrZero(response.total_days_returned);

  return {
    success: resolveSuccessFlag(root, response),
    start_date: toStringOrNull(response.start_date) ?? undefined,
    end_date: toStringOrNull(response.end_date) ?? "",
    total_days_returned: totalDaysReturned || comparison.length,
    aggregation_strategy: toStringOrNull(response.aggregation_strategy) ?? "unknown",
    metrics: {
      compared_days: comparedDays ?? comparison.length,
      mae: toFiniteNumberOrNull(rawMetrics.mae),
      rmse: toFiniteNumberOrNull(rawMetrics.rmse),
      mape: toFiniteNumberOrNull(rawMetrics.mape),
    },
    comparison,
  };
};

export const fetchPredictionComparison = async (
  startDate: string,
  endDate: string,
): Promise<PredictionComparisonResponse> => {
  const params = new URLSearchParams({
    start_date: startDate,
    end_date: endDate,
  });

  const payload = await fetchJson<unknown>(
    `${COMPARE_API_URL}?${params.toString()}`,
  );

  return normalizePredictionComparisonResponse(payload);
};

export interface FetchNewsOptions {
  days?: number;
  articleDate?: string;
}

export interface FetchNewsRequestOptions {
  forceRefresh?: boolean;
}

interface NewsCacheEntry {
  data: NewsResponse;
  timestamp: number;
}

const NEWS_CACHE_TTL_MS = 5 * 60 * 1000;
const newsResponseCache = new Map<string, NewsCacheEntry>();
const newsInFlightRequests = new Map<string, Promise<NewsResponse>>();

const buildNewsCacheKey = (options?: FetchNewsOptions): string => {
  if (options?.articleDate) {
    return `articleDate:${options.articleDate}`;
  }

  if (typeof options?.days === "number") {
    return `days:${options.days}`;
  }

  return "default";
};

const getFreshNewsCacheEntry = (options?: FetchNewsOptions): NewsCacheEntry | null => {
  const entry = newsResponseCache.get(buildNewsCacheKey(options));

  if (!entry) {
    return null;
  }

  if (Date.now() - entry.timestamp > NEWS_CACHE_TTL_MS) {
    newsResponseCache.delete(buildNewsCacheKey(options));
    return null;
  }

  return entry;
};

export const getCachedNews = (options?: FetchNewsOptions): NewsResponse | null =>
  newsResponseCache.get(buildNewsCacheKey(options))?.data ?? null;

export const clearNewsCache = (): void => {
  newsResponseCache.clear();
  newsInFlightRequests.clear();
};

const toNewsArticle = (item: unknown, index: number): NewsArticle => {
  const row = isRecord(item) ? item : {};
  const id =
    toStringOrNull(row.id) ??
    toStringOrNull(row.article_id) ??
    toStringOrNull(row.url) ??
    `news-${index}`;
  const articleDate =
    toStringOrNull(row.article_date) ??
    toStringOrNull(row.date) ??
    toStringOrNull(row.published_at) ??
    "Unknown";

  return {
    id,
    title: toStringOrNull(row.title) ?? "Untitled article",
    summary:
      toStringOrNull(row.summary) ??
      toStringOrNull(row.description) ??
      toStringOrNull(row.content),
    source:
      toStringOrNull(row.source) ?? toStringOrNull(row.publisher) ?? null,
    url: toStringOrNull(row.url) ?? toStringOrNull(row.link),
    image_url:
      toStringOrNull(row.image_url) ??
      toStringOrNull(row.image) ??
      toStringOrNull(row.thumbnail),
    article_date: articleDate,
    published_at: toStringOrNull(row.published_at),
  };
};

const normalizeNewsResponse = (payload: unknown): NewsResponse => {
  let rawArticles: unknown[] = [];
  let success = true;

  if (Array.isArray(payload)) {
    rawArticles = payload;
  } else if (isRecord(payload)) {
    const root = payload;
    const nested = root.data;
    const nestedRecord = isRecord(nested) ? nested : null;

    success = resolveSuccessFlag(root, nestedRecord ?? root);

    if (Array.isArray(nested)) {
      rawArticles = nested;
    } else {
      const containers = [root, nestedRecord].filter(
        (container): container is Record<string, unknown> => Boolean(container),
      );

      for (const container of containers) {
        const candidates = [container.articles, container.data, container.results];
        const listCandidate = candidates.find((candidate) => Array.isArray(candidate));
        if (Array.isArray(listCandidate)) {
          rawArticles = listCandidate;
          break;
        }
      }
    }
  }

  const articles = rawArticles.map((item, index) => toNewsArticle(item, index));
  const dates = Array.from(
    new Set(
      articles
        .map((article) => normalizeDateOnly(article.article_date))
        .filter((date) => date !== "Unknown"),
    ),
  ).sort((a, b) => (a < b ? 1 : -1));

  return {
    success,
    articles,
    dates,
  };
};

export const fetchNews = async (
  options?: FetchNewsOptions,
  requestOptions?: FetchNewsRequestOptions,
): Promise<NewsResponse> => {
  const cacheKey = buildNewsCacheKey(options);
  const useCache = !requestOptions?.forceRefresh;

  if (useCache) {
    const cachedEntry = getFreshNewsCacheEntry(options);
    if (cachedEntry) {
      return cachedEntry.data;
    }

    const inFlightRequest = newsInFlightRequests.get(cacheKey);
    if (inFlightRequest) {
      return inFlightRequest;
    }
  }

  const params = new URLSearchParams();

  if (options?.articleDate) {
    params.set("article_date", options.articleDate);
  } else if (typeof options?.days === "number") {
    params.set("days", String(options.days));
  }

  const query = params.toString();
  const url = query ? `${NEWS_API_URL}?${query}` : NEWS_API_URL;
  const request = fetchJson<unknown>(url)
    .then((payload) => normalizeNewsResponse(payload))
    .then((result) => {
      newsResponseCache.set(cacheKey, {
        data: result,
        timestamp: Date.now(),
      });
      return result;
    })
    .finally(() => {
      newsInFlightRequests.delete(cacheKey);
    });

  newsInFlightRequests.set(cacheKey, request);
  return request;
};

const buildHistoricalResult = (
  allRows: HistoricalPricesResponse["data"],
  firstPage: HistoricalPricesResponse,
): HistoricalPricesResponse => {
  // Guard against overlap between pages and keep timeline order stable.
  const uniqueRows = Array.from(
    new Map(allRows.map((row) => [row.date, row])).values(),
  ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const lastRow = [...uniqueRows].pop();

  return {
    ...firstPage,
    data: uniqueRows,
    total_records: uniqueRows.length,
    offset: 0,
    date_range: {
      start: uniqueRows.length
        ? normalizeDateOnly(uniqueRows[0].date)
        : firstPage.date_range.start,
      end: lastRow
        ? normalizeDateOnly(lastRow.date)
        : firstPage.date_range.end,
    },
  };
};

const fetchHistoricalPage = (
  offset: number,
  limit: number,
): Promise<HistoricalPricesResponse> =>
  fetchJson<unknown>(`${HISTORICAL_API_URL}?limit=${limit}&offset=${offset}`).then(
    (payload) => normalizeHistoricalResponse(payload, limit),
  );

export const fetchHistoricalPrices = async (
  pageLimit = DEFAULT_HISTORICAL_PAGE_LIMIT,
): Promise<HistoricalPricesResponse> => {
  const firstPage = await fetchHistoricalPage(0, pageLimit);
  const totalAvailable = firstPage.total_available ?? firstPage.total_records;
  const effectivePageLimit = firstPage.limit || pageLimit;
  const allRows = [...firstPage.data];

  let offset = firstPage.offset + firstPage.data.length;

  while (offset < totalAvailable) {
    const page = await fetchHistoricalPage(offset, effectivePageLimit);
    if (!page.data.length) break;

    allRows.push(...page.data);
    offset += page.data.length;
  }

  return buildHistoricalResult(allRows, firstPage);
};

/**
 * Fetches historical prices page-by-page and calls `onProgress` after each
 * page so callers can render partial data immediately instead of waiting for
 * all pages to arrive.
 *
 * @param onProgress - called with the accumulated result and a 0-100 progress value
 */
export const fetchHistoricalPricesProgressive = async (
  onProgress: (partial: HistoricalPricesResponse, progress: number) => void,
  pageLimit = DEFAULT_HISTORICAL_PAGE_LIMIT,
): Promise<HistoricalPricesResponse> => {
  const firstPage = await fetchHistoricalPage(0, pageLimit);
  const totalAvailable = firstPage.total_available ?? firstPage.total_records;
  const effectivePageLimit = firstPage.limit || pageLimit;
  const allRows = [...firstPage.data];

  // Surface first page immediately so the chart can render at once.
  const firstProgress = totalAvailable
    ? Math.min((allRows.length / totalAvailable) * 100, 99)
    : 100;
  onProgress(buildHistoricalResult(allRows, firstPage), firstProgress);

  let offset = firstPage.offset + firstPage.data.length;

  while (offset < totalAvailable) {
    const page = await fetchHistoricalPage(offset, effectivePageLimit);
    if (!page.data.length) break;

    allRows.push(...page.data);
    offset += page.data.length;

    const progress = Math.min((allRows.length / totalAvailable) * 100, 99);
    onProgress(buildHistoricalResult(allRows, firstPage), progress);
  }

  const finalResult = buildHistoricalResult(allRows, firstPage);
  onProgress(finalResult, 100);
  return finalResult;
};

/**
 * Downloads the Excel template for uploading custom data
 */
export const downloadExcelTemplate = async (): Promise<void> => {
  try {
    const response = await fetch(UPLOAD_EXCEL_TEMPLATE_URL);

    if (!response.ok) {
      throw new Error(`Failed to download template: ${response.status}`);
    }

    const blob = await response.blob();
    const url = globalThis.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "oil_price_template.xlsx";
    document.body.appendChild(link);
    link.click();
    link.remove();
    globalThis.URL.revokeObjectURL(url);
  } catch (error) {
    throw new Error(`Error downloading template: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
};

/**
 * Uploads an Excel file and returns predictions
 */
export const uploadExcelFile = async (file: File): Promise<PredictionResponse> => {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(UPLOAD_EXCEL_API_URL, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      let errorDetail = "";
      try {
        const errorPayload = await response.json();
        if (isRecord(errorPayload) && isRecord(errorPayload.error)) {
          errorDetail = toStringOrDefault(errorPayload.error.detail);
        } else if (isRecord(errorPayload)) {
          errorDetail = toStringOrDefault(errorPayload.message || errorPayload.detail);
        }
      } catch {
        // Failed to parse error response body
      }
      const error = new Error(errorDetail || `HTTP error! status: ${response.status}`);
      (error as any).detail = errorDetail;
      throw error;
    }

    const payload = await response.json();
    return normalizePredictionResponse(payload);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    const detail = (error as any)?.detail || "";
    // If detail exists, use simple message to avoid duplication
    const finalMessage = detail ? "Upload failed" : `Error uploading file: ${message}`;
    const err = new Error(finalMessage);
    (err as any).detail = detail || message;
    throw err;
  }
};

const EXPLAIN_CONTRIBUTION_KEY_ALIASES: Record<string, string> = {
  arima_contribution_usd: "arima",
  mid_gru_contribution_usd: "gru_mid",
  sentiment_gru_contribution_usd: "gru_sent",
  xgboost_contribution_usd: "xgb_hf",
};

const normalizeExplainContributionKey = (key: string): string => {
  const normalized = key.toLowerCase();
  return (
    EXPLAIN_CONTRIBUTION_KEY_ALIASES[normalized] ??
    normalized.replace(/_contribution_usd$/, "")
  );
};

const getExplainContributionSource = (
  response: Record<string, unknown>,
): Record<string, unknown> => {
  if (isRecord(response.model_contributions)) {
    return response.model_contributions;
  }

  if (isRecord(response.sub_model_contributions)) {
    return response.sub_model_contributions;
  }

  return {};
};

const getExplainTopFeaturesSource = (response: Record<string, unknown>): unknown[] => {
  if (Array.isArray(response.top_features)) {
    return response.top_features;
  }

  if (Array.isArray(response.top_feature_drivers)) {
    return response.top_feature_drivers;
  }

  return [];
};

const deriveExplainConfidenceLevel = (response: Record<string, unknown>): string => {
  const explicitLevel = toStringOrDefault(response.confidence_level);
  if (explicitLevel) return explicitLevel;

  const horizonAccuracy = toFiniteNumberOrNull(response.horizon_accuracy);
  if (horizonAccuracy === null) return "medium";
  if (horizonAccuracy >= 70) return "high";
  if (horizonAccuracy >= 40) return "medium";
  return "low";
};

const getExplainConfidenceBounds = (
  response: Record<string, unknown>,
): { lower: number; upper: number } => {
  const rawConfidenceInterval = response.confidence_interval;
  const confidenceIntervalRecord = isRecord(rawConfidenceInterval)
    ? rawConfidenceInterval
    : null;
  const confidenceIntervalArray = Array.isArray(rawConfidenceInterval)
    ? rawConfidenceInterval
    : null;

  return {
    lower:
      toFiniteNumberOrNull(response.confidence_interval_lower) ??
      toFiniteNumberOrNull(confidenceIntervalRecord?.lower) ??
      toFiniteNumberOrNull(confidenceIntervalRecord?.min) ??
      toFiniteNumberOrNull(confidenceIntervalArray?.[0]) ??
      0,
    upper:
      toFiniteNumberOrNull(response.confidence_interval_upper) ??
      toFiniteNumberOrNull(confidenceIntervalRecord?.upper) ??
      toFiniteNumberOrNull(confidenceIntervalRecord?.max) ??
      toFiniteNumberOrNull(confidenceIntervalArray?.[1]) ??
      0,
  };
};

const normalizeExplainResponse = (payload: unknown): ExplainResponse => {
  const { root, response } = unwrapRecordPayload(payload);
  const success = resolveSuccessFlag(root, response);
  const confidenceBounds = getExplainConfidenceBounds(response);

  const modelContributions: Record<string, number> = {};
  for (const [key, value] of Object.entries(getExplainContributionSource(response))) {
    const contribution = toFiniteNumberOrNull(value);
    if (contribution === null) continue;

    const normalizedKey = normalizeExplainContributionKey(key);
    modelContributions[normalizedKey] =
      (modelContributions[normalizedKey] ?? 0) + contribution;
  }

  const topFeatures = getExplainTopFeaturesSource(response)
    .filter(isRecord)
    .map((item) => ({
      feature_name:
        toStringOrDefault(item.feature_name) ||
        toStringOrDefault(item.feature) ||
        toStringOrDefault(item.name),
      shap_value:
        toFiniteNumberOrDefault(item.shap_value) ||
        toFiniteNumberOrDefault(item.shap_value_usd),
      shap_value_usd: toFiniteNumberOrNull(item.shap_value_usd) ?? undefined,
      feature_value: toFiniteNumberOrDefault(item.feature_value),
      direction: toStringOrNull(item.direction) ?? undefined,
      category: toStringOrNull(item.category) ?? undefined,
    }))
    .filter((item) => item.feature_name.length > 0);

  const sentimentHeadlines = (Array.isArray(response.sentiment_headlines)
    ? response.sentiment_headlines
    : []
  )
    .map((headline) => {
      if (typeof headline === "string") return headline;
      if (!isRecord(headline)) return null;

      return (
        toStringOrNull(headline.headline) ??
        toStringOrNull(headline.title) ??
        toStringOrNull(headline.summary)
      );
    })
    .filter((headline): headline is string => headline !== null);

  const attentionInsight = isRecord(response.attention_insight)
    ? {
      top_sentiment_feature:
        toStringOrNull(response.attention_insight.top_sentiment_feature) ??
        undefined,
      top_timestep_lag:
        toFiniteNumberOrNull(response.attention_insight.top_timestep_lag) ??
        undefined,
      attention_weight:
        toFiniteNumberOrNull(response.attention_insight.attention_weight) ??
        undefined,
      high_news_regime_flagged:
        typeof response.attention_insight.high_news_regime_flagged === "boolean"
          ? response.attention_insight.high_news_regime_flagged
          : undefined,
    }
    : undefined;

  const dominantModel =
    toStringOrNull(response.dominant_model) ??
    (isRecord(response.sub_model_contributions)
      ? toStringOrNull(response.sub_model_contributions.dominant_model)
      : null) ??
    (isRecord(response.model_weights)
      ? toStringOrNull(response.model_weights.dominant_model)
      : null) ??
    undefined;

  return {
    success,
    explanation_date:
      toStringOrDefault(response.explanation_date) ||
      toStringOrDefault(response.date),
    prediction:
      toFiniteNumberOrNull(response.prediction) ??
      toFiniteNumberOrDefault(response.forecast_price),
    current_price:
      toFiniteNumberOrNull(response.current_price) ?? undefined,
    direction: toStringOrNull(response.direction) ?? undefined,
    horizon: toFiniteNumberOrNull(response.horizon) ?? undefined,
    model_version: toStringOrNull(response.model_version) ?? undefined,
    confidence_interval_lower: confidenceBounds.lower,
    confidence_interval_upper: confidenceBounds.upper,
    confidence_level: deriveExplainConfidenceLevel(response),
    agreement_score:
      toFiniteNumberOrNull(response.agreement_score) ??
      toFiniteNumberOrDefault(response.model_agreement),
    dominant_model: dominantModel,
    total_sentiment_impact_usd:
      toFiniteNumberOrNull(response.total_sentiment_impact_usd) ?? undefined,
    sentiment_dominant:
      typeof response.sentiment_dominant === "boolean"
        ? response.sentiment_dominant
        : undefined,
    model_contributions: modelContributions,
    top_features: topFeatures,
    sentiment_headlines: sentimentHeadlines,
    headline: toStringOrNull(response.headline) ?? undefined,
    explanation_text:
      toStringOrDefault(response.explanation_text) ||
      toStringOrDefault(response.forecast_analysis) ||
      toStringOrDefault(response.summary) ||
      toStringOrDefault(response.narrative) ||
      toStringOrDefault(response.headline),
    sentiment_story: toStringOrNull(response.sentiment_story) ?? undefined,
    risk_note: toStringOrNull(response.risk_note) ?? undefined,
    attention_insight: attentionInsight,
    generated_at:
      toStringOrDefault(response.generated_at) ||
      toStringOrDefault(response.created_at) ||
      toStringOrDefault(response.date),
    computation_time_seconds:
      toFiniteNumberOrNull(response.computation_time_seconds) ??
      toFiniteNumberOrDefault(response.inference_time_seconds),
  };
};

export const fetchExplain = async (): Promise<ExplainResponse> =>
  normalizeExplainResponse(await fetchJson<unknown>(EXPLAIN_API_URL));
