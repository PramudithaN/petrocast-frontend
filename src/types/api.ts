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

export interface PredictionComparisonMetrics {
  compared_days: number | null;
  mae: number | null;
  rmse: number | null;
  mape: number | null;
}

export interface PredictionComparisonPoint {
  date: string;
  actual_price: number | null;
  predicted_price: number | null;
  predicted_price_median: number | null;
  predicted_price_latest: number | null;
  prediction_count: number;
  error: number | null;
  abs_error: number | null;
  abs_pct_error: number | null;
}

export interface PredictionComparisonResponse {
  success: boolean;
  start_date?: string;
  end_date: string;
  total_days_returned: number;
  aggregation_strategy: string;
  metrics: PredictionComparisonMetrics;
  comparison: PredictionComparisonPoint[];
}

export interface NewsArticle {
  id: string;
  title: string;
  summary: string | null;
  source: string | null;
  url: string | null;
  image_url: string | null;
  article_date: string;
  published_at: string | null;
}

export interface NewsResponse {
  success: boolean;
  articles: NewsArticle[];
  dates: string[];
}
