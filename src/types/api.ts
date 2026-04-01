export interface Forecast {
  date: string;
  /** Point estimate used as the median forecast for display. */
  forecasted_price: number;
  forecasted_return: number;
  horizon: number;
  lower_bound?: number;
  upper_bound?: number;
}

export interface PredictionResponse {
  success: boolean;
  data_source: string;
  last_price_date: string;
  last_price: number;
  forecasts: Forecast[];
  market_state: string;
  is_market_open: boolean;
  market_open_time?: string;
  market_close_time?: string;
  timezone_info?: string;
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
  predicted_price_lower_bound: number | null;
  predicted_price_upper_bound: number | null;
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

export interface SentimentHeadline {
  title: string;
  source: string;
  sentiment_score: number;
  published_at: string;
  url: string;
}

export interface SentimentEmaSeries {
  daily_sentiment_decay_ema_3?: number;
  daily_sentiment_decay_ema_7?: number;
  daily_sentiment_decay_ema_14?: number;
  news_volume_ema_3?: number;
  news_volume_ema_7?: number;
  news_volume_ema_14?: number;
  log_news_volume_ema_3?: number;
  log_news_volume_ema_7?: number;
  log_news_volume_ema_14?: number;
  decayed_news_volume_ema_3?: number;
  decayed_news_volume_ema_7?: number;
  decayed_news_volume_ema_14?: number;
}

export interface SentimentTimelinePoint {
  date: string;
  raw_daily_sentiment: number;
  cross_day_decayed_sentiment: number;
  sentiment_change_vs_prev_day: number;
  decayed_sentiment_change_vs_prev_day: number;
  news_volume: number;
  log_news_volume: number;
  decayed_news_volume: number;
  high_news_regime: boolean;
  ema: SentimentEmaSeries;
  headlines: SentimentHeadline[];
}

export interface SentimentOverviewMeta {
  requested_days: number;
  actual_records: number;
  start_date: string;
  end_date: string;
  decay_lambda: number;
  decay_factor: number;
  decay_formula: string;
  ema_windows: number[];
}

export interface SentimentOverviewSummary {
  latest_raw_sentiment: number;
  latest_decayed_sentiment: number;
  average_raw_sentiment: number;
  average_decayed_sentiment: number;
  average_news_volume: number;
  high_news_regime_days: number;
  positive_days: number;
  negative_days: number;
  neutral_days: number;
  latest_trend: string;
}

export interface SentimentOverviewResponse {
  success: boolean;
  meta: SentimentOverviewMeta;
  summary: SentimentOverviewSummary;
  timeline: SentimentTimelinePoint[];
}

/* ─── Explainability ─── */

export interface ExplainTopFeature {
  feature_name: string;
  shap_value: number;
  shap_value_usd?: number;
  feature_value: number;
  direction?: string;
  category?: string;
}

export interface ExplainAttentionInsight {
  top_sentiment_feature?: string;
  top_timestep_lag?: number;
  attention_weight?: number;
  high_news_regime_flagged?: boolean;
}

export interface ExplainResponse {
  success: boolean;
  explanation_date: string;
  prediction: number;
  current_price?: number;
  direction?: string;
  horizon?: number;
  model_version?: string;
  confidence_interval_lower: number;
  confidence_interval_upper: number;
  confidence_level: string;
  agreement_score: number;
  dominant_model?: string;
  total_sentiment_impact_usd?: number;
  sentiment_dominant?: boolean;
  model_contributions: Record<string, number>;
  top_features: ExplainTopFeature[];
  sentiment_headlines: string[];
  headline?: string;
  explanation_text: string;
  sentiment_story?: string;
  risk_note?: string;
  attention_insight?: ExplainAttentionInsight;
  generated_at: string;
  computation_time_seconds: number;
}
