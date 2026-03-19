import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  clearNewsCache,
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
    clearNewsCache();
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

  it('normalizes fan payload nested under data', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          success: true,
          data: {
            last_price_date: '2026-03-19',
            last_price: 72.9,
            fan: [
              {
                date: '2026-03-20',
                point_forecast: 73.1,
                p10: 72,
                p25: 72.5,
                p50: 73.1,
                p75: 73.8,
                p90: 74.2,
                sample_count: 120,
              },
            ],
          },
        }),
    });

    const result = await fetchFanPredictions();

    expect(result).toEqual({
      success: true,
      last_price_date: '2026-03-19',
      last_price: 72.9,
      fan: [
        {
          date: '2026-03-20',
          point_forecast: 73.1,
          p10: 72,
          p25: 72.5,
          p50: 73.1,
          p75: 73.8,
          p90: 74.2,
          sample_count: 120,
        },
      ],
    });
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

  it('normalizes historical payload nested under data', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          success: true,
          data: {
            granularity: 'daily',
            total_available: 1,
            total_records: 1,
            limit: 100,
            offset: 0,
            date_range: {
              start: '2026-03-18',
              end: '2026-03-18',
            },
            data: [
              {
                date: '2026-03-18',
                price: 72.8,
                open: 72.1,
                high: 73,
                low: 71.9,
                volume: 1000,
                change_pct: 1.1,
                source: 'api-v2',
              },
            ],
          },
        }),
    });

    const result = await fetchHistoricalPrices(100);

    expect(result.success).toBe(true);
    expect(result.data).toHaveLength(1);
    expect(result.data[0].source).toBe('api-v2');
    expect(result.date_range).toEqual({
      start: '2026-03-18',
      end: '2026-03-18',
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

  it('normalizes comparison payload nested under data', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          success: true,
          data: {
            start_date: '2026-03-01',
            end_date: '2026-03-10',
            total_days_returned: 1,
            aggregation_strategy: 'median',
            metrics: {
              compared_days: 1,
              mae: 0.5,
              rmse: 0.6,
              mape: 0.7,
            },
            comparison: [
              {
                date: '2026-03-10',
                actual_price: 73,
                predicted_price: 72.8,
                predicted_price_median: 72.9,
                predicted_price_latest: 72.7,
                prediction_count: 3,
                error: -0.2,
                abs_error: 0.2,
                abs_pct_error: 0.27,
              },
            ],
          },
        }),
    });

    const result = await fetchPredictionComparison('2026-03-01', '2026-03-10');

    expect(result).toEqual({
      success: true,
      start_date: '2026-03-01',
      end_date: '2026-03-10',
      total_days_returned: 1,
      aggregation_strategy: 'median',
      metrics: {
        compared_days: 1,
        mae: 0.5,
        rmse: 0.6,
        mape: 0.7,
      },
      comparison: [
        {
          date: '2026-03-10',
          actual_price: 73,
          predicted_price: 72.8,
          predicted_price_median: 72.9,
          predicted_price_latest: 72.7,
          prediction_count: 3,
          error: -0.2,
          abs_error: 0.2,
          abs_pct_error: 0.27,
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

  it('normalizes news payload nested under data.articles', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          success: true,
          data: {
            articles: [
              {
                id: 'article-1',
                title: 'Market Update',
                summary: 'Brent rises',
                source: 'Reuters',
                url: 'https://example.com',
                image_url: 'https://example.com/image.jpg',
                article_date: '2026-03-19',
                published_at: '2026-03-19T09:00:00Z',
              },
            ],
          },
        }),
    });

    const result = await fetchNews();

    expect(result.success).toBe(true);
    expect(result.articles).toHaveLength(1);
    expect(result.articles[0].title).toBe('Market Update');
    expect(result.dates).toEqual(['2026-03-19']);
  });

  it('reuses cached news responses for identical requests', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          success: true,
          articles: [
            {
              id: 'cached-article',
              title: 'Cached headline',
              article_date: '2026-03-19',
            },
          ],
        }),
    });

    const firstResult = await fetchNews({ days: 9 });
    const secondResult = await fetchNews({ days: 9 });

    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(secondResult).toEqual(firstResult);
  });

  it('deduplicates in-flight news requests and refreshes on demand', async () => {
    let resolveFirstRequest: ((value: unknown) => void) | undefined;

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        new Promise((resolve) => {
          resolveFirstRequest = resolve;
        }),
    });

    const firstRequest = fetchNews({ days: 12 });
    const secondRequest = fetchNews({ days: 12 });

    await Promise.resolve();

    expect(mockFetch).toHaveBeenCalledTimes(1);

    resolveFirstRequest?.({
      success: true,
      articles: [
        {
          id: 'first-version',
          title: 'First version',
          article_date: '2026-03-18',
        },
      ],
    });

    const [firstResult, secondResult] = await Promise.all([firstRequest, secondRequest]);

    expect(firstResult).toEqual(secondResult);

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          success: true,
          articles: [
            {
              id: 'refreshed-version',
              title: 'Refreshed version',
              article_date: '2026-03-19',
            },
          ],
        }),
    });

    const refreshedResult = await fetchNews({ days: 12 }, { forceRefresh: true });

    expect(mockFetch).toHaveBeenCalledTimes(2);
    expect(refreshedResult.articles[0].title).toBe('Refreshed version');
  });
});