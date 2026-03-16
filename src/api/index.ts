import {
  FanResponse,
  HistoricalPricesResponse,
  PredictionResponse,
} from "../types/api";

const BASE_API_URL = "https://pramudithan-oil-price-prediction.hf.space";
const PREDICTION_API_URL = `${BASE_API_URL}/predict`;
const FAN_API_URL = `${BASE_API_URL}/predictions/fan`;
const HISTORICAL_API_URL = `${BASE_API_URL}/historical/prices`;
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
