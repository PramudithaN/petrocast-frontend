import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Dashboard from './Dashboard';
import { NotificationProvider } from '../context/NotificationContext';
import { DateConfigProvider } from '../context/DateConfigContext';

// Set up fetch mock
const mockFetch = vi.fn();
globalThis.fetch = mockFetch;

const getRequestUrl = (input: RequestInfo | URL): string => {
  if (typeof input === 'string') return input;
  if (input instanceof URL) return input.toString();
  return input.url;
};

const mockPredictions = {
  success: true,
  data_source: 'test',
  last_price_date: '2025-01-01',
  last_price: 71.5,
  market_state: 'neutral',
  forecasts: [
    {
      date: '2025-01-02',
      forecasted_price: 72,
      forecasted_return: 0.5,
      horizon: 1,
    },
    {
      date: '2025-01-03',
      forecasted_price: 73,
      forecasted_return: 1.1,
      horizon: 2,
    },
  ],
};

const mockFan = {
  success: true,
  last_price_date: '2025-01-01',
  last_price: 71.5,
  fan: [
    {
      date: '2025-01-02',
      point_forecast: 72,
      p10: 70,
      p25: 71,
      p50: 72,
      p75: 73,
      p90: 74,
      sample_count: 100,
    },
  ],
};

const mockHistorical = {
  success: true,
  granularity: 'daily',
  total_available: 1,
  total_records: 1,
  limit: 500,
  offset: 0,
  date_range: {
    start: '2025-01-01',
    end: '2025-01-01',
  },
  data: [
    {
      date: '2025-01-01',
      price: 71.5,
      open: 71,
      high: 72,
      low: 70.5,
      volume: 1000,
      change_pct: 0.2,
      source: 'test',
    },
  ],
};

const mockComparison = {
  success: true,
  start_date: '2026-01-01',
  end_date: '2026-03-17',
  total_days_returned: 2,
  aggregation_strategy: 'weighted mean',
  metrics: {
    compared_days: 2,
    mae: 1.2,
    rmse: 1.6,
    mape: 2.1,
  },
  comparison: [
    {
      date: '2026-01-29',
      actual_price: 70.71,
      predicted_price: 69.6,
      predicted_price_median: 69.6,
      predicted_price_latest: 69.6,
      prediction_count: 1,
      error: 1.11,
      abs_error: 1.11,
      abs_pct_error: 1.57,
    },
    {
      date: '2026-01-30',
      actual_price: 70.69,
      predicted_price: 72.25,
      predicted_price_median: 72.12,
      predicted_price_latest: 72.52,
      prediction_count: 2,
      error: -1.56,
      abs_error: 1.56,
      abs_pct_error: 2.21,
    },
  ],
};

// Mock chart components since they access complex DOM APIs not in jsdom
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: any) => <div>{children}</div>,
  ComposedChart: ({ children }: any) => <div>{children}</div>,
  AreaChart: () => <div data-testid="chart" />,
  BarChart: () => <div />,
  LineChart: () => <div />,
  Area: () => null,
  Bar: () => null,
  Line: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
  ReferenceLine: () => null,
}));

const renderWithProviders = () =>
  render(
    <DateConfigProvider locale="en-US" timezone="UTC">
      <NotificationProvider>
        <Dashboard />
      </NotificationProvider>
    </DateConfigProvider>,
  );

describe('Dashboard Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockImplementation((input: RequestInfo | URL) => {
      const url = getRequestUrl(input);
      if (url.includes('/predictions/fan')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockFan),
        });
      }
      if (url.includes('/historical/prices')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockHistorical),
        });
      }
      if (url.includes('/predictions/compare')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockComparison),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockPredictions),
      });
    });
  });

  it('renders correctly initial values', async () => {
    renderWithProviders();
    
    // Check loading state (animate-pulse)
    const pulses = document.querySelectorAll('.animate-pulse');
    expect(pulses.length).toBeGreaterThan(0);
    
    // Wait for data load
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled();
    }, { timeout: 3000 });
  });

  it('displays price update', async () => {
    renderWithProviders();
    
    await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled();
    });
  });

  it('defers hidden-tab toasts until the user opens that tab', async () => {
    renderWithProviders();

    expect(await screen.findByText('Forecast loaded')).toBeInTheDocument();

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(4);
    });

    expect(screen.queryByText('Historical data ready')).not.toBeInTheDocument();
    expect(screen.queryByText('Analytics updated')).not.toBeInTheDocument();
    expect(screen.queryByText('Fan chart ready')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Historical Data' }));
    expect(await screen.findByText('Historical data ready')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Analytics' }));
    expect(await screen.findByText('Analytics updated')).toBeInTheDocument();
    expect(await screen.findByText('Fan chart ready')).toBeInTheDocument();
  });

  it('renders analytics safely when compare metrics contain nulls', async () => {
    mockFetch.mockImplementation((input: RequestInfo | URL) => {
      const url = getRequestUrl(input);
      if (url.includes('/predictions/fan')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockFan),
        });
      }
      if (url.includes('/historical/prices')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockHistorical),
        });
      }
      if (url.includes('/predictions/compare')) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              ...mockComparison,
              metrics: {
                compared_days: null,
                mae: null,
                rmse: null,
                mape: null,
              },
              comparison: [
                {
                  ...mockComparison.comparison[0],
                  actual_price: null,
                  predicted_price: null,
                  abs_error: null,
                },
              ],
            }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockPredictions),
      });
    });

    renderWithProviders();

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Analytics' }));

    await waitFor(() => {
      expect(screen.getAllByText('$0.00')).toHaveLength(2);
      expect(screen.getByText('1')).toBeInTheDocument();
    });
  });
});
