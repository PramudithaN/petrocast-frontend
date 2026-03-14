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
