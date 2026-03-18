import {
  FanResponse,
  HistoricalPricesResponse,
  NewsArticle,
  NewsResponse,
  PredictionComparisonResponse,
  PredictionResponse,
} from "../types/api";

const BASE_API_URL = "https://pramudithan-oil-price-prediction.hf.space";
const PREDICTION_API_URL = `${BASE_API_URL}/predict`;
const FAN_API_URL = `${BASE_API_URL}/predictions/fan`;
const COMPARE_API_URL = `${BASE_API_URL}/predictions/compare`;
const HISTORICAL_API_URL = `${BASE_API_URL}/historical/prices`;
const NEWS_API_URL = `${BASE_API_URL}/news`;
const UPLOAD_EXCEL_API_URL = `${BASE_API_URL}/predict/upload-excel`;
const UPLOAD_EXCEL_TEMPLATE_URL = `${BASE_API_URL}/predict/upload-excel/template`;
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

const normalizePredictionResponse = (payload: unknown): PredictionResponse => {
  const response = isRecord(payload) ? payload : {};
  const rawForecasts = Array.isArray(response.forecasts) ? response.forecasts : [];

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
    success: typeof response.success === "boolean" ? response.success : true,
    data_source: toStringOrDefault(response.data_source, "unknown"),
    last_price_date: toStringOrDefault(response.last_price_date),
    last_price: toFiniteNumberOrDefault(response.last_price),
    forecasts,
    market_state: toStringOrDefault(response.market_state, "UNKNOWN"),
  };
};

const normalizeFanResponse = (payload: unknown): FanResponse => {
  const response = isRecord(payload) ? payload : {};
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
    success: typeof response.success === "boolean" ? response.success : true,
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
  const response = isRecord(payload) ? payload : {};
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
    success: typeof response.success === "boolean" ? response.success : true,
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
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
};

export const fetchPredictions = async (): Promise<PredictionResponse> =>
  normalizePredictionResponse(await fetchJson<unknown>(PREDICTION_API_URL));

export const fetchFanPredictions = async (): Promise<FanResponse> =>
  normalizeFanResponse(await fetchJson<unknown>(FAN_API_URL));

const normalizePredictionComparisonResponse = (
  payload: unknown,
): PredictionComparisonResponse => {
  const response = isRecord(payload) ? payload : {};
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
    success: typeof response.success === "boolean" ? response.success : true,
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
    success = typeof payload.success === "boolean" ? payload.success : true;
    const candidates = [payload.articles, payload.data, payload.results];
    const listCandidate = candidates.find((candidate) => Array.isArray(candidate));
    rawArticles = Array.isArray(listCandidate) ? listCandidate : [];
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
): Promise<NewsResponse> => {
  const params = new URLSearchParams();

  if (options?.articleDate) {
    params.set("article_date", options.articleDate);
  } else if (typeof options?.days === "number") {
    params.set("days", String(options.days));
  }

  const query = params.toString();
  const url = query ? `${NEWS_API_URL}?${query}` : NEWS_API_URL;
  const payload = await fetchJson<unknown>(url);
  return normalizeNewsResponse(payload);
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
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "oil_price_template.xlsx";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
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
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const payload = await response.json();
    return normalizePredictionResponse(payload);
  } catch (error) {
    throw new Error(`Error uploading file: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
};
