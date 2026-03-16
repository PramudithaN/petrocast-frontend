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
const DEFAULT_HISTORICAL_PAGE_LIMIT = 500;

const normalizeDateOnly = (dateString: string): string =>
  dateString.includes("T") ? dateString.split("T")[0] : dateString;

const fetchJson = async <T>(url: string): Promise<T> => {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
};

export const fetchPredictions = async (): Promise<PredictionResponse> =>
  fetchJson<PredictionResponse>(PREDICTION_API_URL);

export const fetchFanPredictions = async (): Promise<FanResponse> =>
  fetchJson<FanResponse>(FAN_API_URL);

export const fetchPredictionComparison = async (
  startDate: string,
  endDate: string,
): Promise<PredictionComparisonResponse> => {
  const params = new URLSearchParams({
    start_date: startDate,
    end_date: endDate,
  });

  return fetchJson<PredictionComparisonResponse>(
    `${COMPARE_API_URL}?${params.toString()}`,
  );
};

export interface FetchNewsOptions {
  days?: number;
  articleDate?: string;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const toStringOrNull = (value: unknown): string | null =>
  typeof value === "string" && value.trim().length > 0 ? value : null;

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
  fetchJson<HistoricalPricesResponse>(
    `${HISTORICAL_API_URL}?limit=${limit}&offset=${offset}`,
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
