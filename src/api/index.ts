import {
  HistoricalPricesResponse,
  PredictionResponse,
} from "../types/api";

const BASE_API_URL = "https://pramudithan-oil-price-prediction.hf.space";
const PREDICTION_API_URL = `${BASE_API_URL}/predict`;
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

export const fetchHistoricalPrices = async (
  pageLimit = DEFAULT_HISTORICAL_PAGE_LIMIT,
): Promise<HistoricalPricesResponse> => {
  const fetchPage = async (
    offset: number,
    limit: number,
  ): Promise<HistoricalPricesResponse> =>
    fetchJson<HistoricalPricesResponse>(
      `${HISTORICAL_API_URL}?limit=${limit}&offset=${offset}`,
    );

  const firstPage = await fetchPage(0, pageLimit);
  const totalAvailable = firstPage.total_available ?? firstPage.total_records;
  const effectivePageLimit = firstPage.limit || pageLimit;
  const allRows = [...firstPage.data];

  let offset = firstPage.offset + firstPage.data.length;

  while (offset < totalAvailable) {
    const page = await fetchPage(offset, effectivePageLimit);
    if (!page.data.length) break;

    allRows.push(...page.data);
    offset += page.data.length;
  }

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
