import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  fetchFanPredictions,
  fetchHistoricalPrices,
  fetchNews,
  fetchPredictionComparison,
  fetchPredictions,
} from './index';

const mockFetch = vi.fn();
globalThis.fetch = mockFetch;

describe('api response normalization', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('normalizes nullish prediction payloads', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          success: true,
          data_source: null,
          last_price_date: undefined,
          last_price: null,
          market_state: undefined,
          forecasts: [
            {
              date: '2026-03-18',
              forecasted_price: null,
              forecasted_return: undefined,
              horizon: null,
            },
            {
              date: null,
              forecasted_price: 99,
            },
          ],
        }),
    });

    const result = await fetchPredictions();

    expect(result).toEqual({
      success: true,
      data_source: 'unknown',
      last_price_date: '',
      last_price: 0,
      market_state: 'UNKNOWN',
      is_market_open: false,
      market_open_time: undefined,
      market_close_time: undefined,
      timezone_info: undefined,
      forecasts: [
        {
          date: '2026-03-18',
          forecasted_price: 0,
          forecasted_return: 0,
          horizon: 1,
        },
      ],
    });
  });

  it('normalizes updated prediction payloads nested under data', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          success: true,
          data: {
            data_source: 'api-v2',
            last_price_date: '2026-03-19',
            last_price: 72.4,
            market_state: 'STABLE',
            is_market_open: true,
            market_open_time: '09:00',
            market_close_time: '17:00',
            timezone_info: 'UTC',
            forecasts: [
              {
                date: '2026-03-20',
                forecasted_price: 73.2,
                forecasted_return: 0.01,
                horizon: 1,
              },
            ],
          },
        }),
    });

    const result = await fetchPredictions();

    expect(result).toEqual({
      success: true,
      data_source: 'api-v2',
      last_price_date: '2026-03-19',
      last_price: 72.4,
      market_state: 'STABLE',
      is_market_open: true,
      market_open_time: '09:00',
      market_close_time: '17:00',
      timezone_info: 'UTC',
      forecasts: [
        {
          date: '2026-03-20',
          forecasted_price: 73.2,
          forecasted_return: 0.01,
          horizon: 1,
        },
      ],
    });
  });

  it('normalizes nullish fan payloads', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          success: true,
          last_price_date: null,
          last_price: '71.5',
          fan: [
            {
              date: '2026-03-18',
              point_forecast: null,
              p10: undefined,
              p25: null,
              p50: null,
              p75: undefined,
              p90: null,
              sample_count: undefined,
            },
            {
              date: undefined,
              point_forecast: 75,
            },
          ],
        }),
    });

    const result = await fetchFanPredictions();

    expect(result.last_price_date).toBe('');
    expect(result.last_price).toBe(71.5);
    expect(result.fan).toEqual([
      {
        date: '2026-03-18',
        point_forecast: 71.5,
        p10: 71.5,
        p25: 71.5,
        p50: 71.5,
        p75: 71.5,
        p90: 71.5,
        sample_count: 0,
      },
    ]);
  });

  it('normalizes nullish historical payloads', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          success: true,
          granularity: null,
          total_available: undefined,
          total_records: null,
          limit: null,
          offset: undefined,
          date_range: {
            start: null,
            end: undefined,
          },
          data: [
            {
              date: '2026-03-17',
              price: '72.1',
              open: null,
              high: undefined,
              low: null,
              volume: undefined,
              change_pct: null,
              source: undefined,
            },
            {
              date: null,
              price: 10,
            },
          ],
        }),
    });

    const result = await fetchHistoricalPrices(200);

    expect(result).toEqual({
      success: true,
      granularity: 'daily',
      total_available: 1,
      total_records: 1,
      limit: 200,
      offset: 0,
      date_range: {
        start: '2026-03-17',
        end: '2026-03-17',
      },
      data: [
        {
          date: '2026-03-17',
          price: 72.1,
          open: 72.1,
          high: 72.1,
          low: 72.1,
          volume: null,
          change_pct: 0,
          source: 'unknown',
        },
      ],
    });
  });

  it('normalizes nullish comparison payloads', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          success: true,
          start_date: null,
          end_date: undefined,
          total_days_returned: null,
          aggregation_strategy: null,
          metrics: {
            compared_days: null,
            mae: undefined,
            rmse: null,
            mape: undefined,
          },
          comparison: [
            {
              date: '2026-03-17',
              actual_price: null,
              predicted_price: undefined,
              predicted_price_median: null,
              predicted_price_latest: undefined,
              prediction_count: null,
              error: undefined,
              abs_error: null,
              abs_pct_error: undefined,
            },
            {
              date: undefined,
              actual_price: 1,
            },
          ],
        }),
    });

    const result = await fetchPredictionComparison('2026-03-01', '2026-03-17');

    expect(result).toEqual({
      success: true,
      start_date: undefined,
      end_date: '',
      total_days_returned: 1,
      aggregation_strategy: 'unknown',
      metrics: {
        compared_days: 1,
        mae: null,
        rmse: null,
        mape: null,
      },
      comparison: [
        {
          date: '2026-03-17',
          actual_price: null,
          predicted_price: null,
          predicted_price_median: null,
          predicted_price_latest: null,
          prediction_count: 0,
          error: null,
          abs_error: null,
          abs_pct_error: null,
        },
      ],
    });
  });

  it('normalizes news payloads with missing fields', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          success: true,
          articles: [
            {
              id: null,
              title: undefined,
              summary: null,
              source: undefined,
              url: null,
              image_url: undefined,
              article_date: null,
              published_at: undefined,
            },
          ],
        }),
    });

    const result = await fetchNews();

    expect(result).toEqual({
      success: true,
      articles: [
        {
          id: 'news-0',
          title: 'Untitled article',
          summary: null,
          source: null,
          url: null,
          image_url: null,
          article_date: 'Unknown',
          published_at: null,
        },
      ],
      dates: [],
    });
  });
});