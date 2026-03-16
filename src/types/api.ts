export interface Forecast {
  date: string;
  forecasted_price: number;
  forecasted_return: number;
  horizon: number;
}

export interface PredictionResponse {
  success: boolean;
  data_source: string;
  last_price_date: string;
  last_price: number;
  forecasts: Forecast[];
  market_state: string;
}

export interface HistoricalPricePoint {
  date: string;
  price: number;
  open: number;
  high: number;
  low: number;
  volume: number | null;
  change_pct: number;
  source: string;
}

export interface HistoricalDateRange {
  start: string;
  end: string;
}

export interface HistoricalPricesResponse {
  success: boolean;
  granularity: string;
  total_available: number;
  total_records: number;
  limit: number;
  offset: number;
  date_range: HistoricalDateRange;
  data: HistoricalPricePoint[];
}

export interface FanPoint {
  date: string;
  point_forecast: number;
  p10: number;
  p25: number;
  p50: number;
  p75: number;
  p90: number;
  sample_count: number;
}

export interface FanResponse {
  success: boolean;
  last_price_date: string;
  last_price: number;
  fan: FanPoint[];
}
