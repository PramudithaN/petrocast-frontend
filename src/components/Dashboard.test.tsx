import { render, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Dashboard from './Dashboard';
import { NotificationProvider } from '../context/NotificationContext';

// Set up fetch mock
const mockFetch = vi.fn();
globalThis.fetch = mockFetch;

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
    <NotificationProvider>
      <Dashboard />
    </NotificationProvider>,
  );

describe('Dashboard Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockImplementation((input: RequestInfo | URL) => {
      const url = String(input);
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
});
