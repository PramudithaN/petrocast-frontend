import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Dashboard from './Dashboard';

// Set up fetch mock
const mockFetch = vi.fn();
window.fetch = mockFetch;

// Mock Response
const mockData = {
  last_price_date: '2025-01-01',
  last_price: 71.5,
  forecasts: [
    { forecasted_date: '2025-01-02', forecasted_price: 72.0 },
    { forecasted_date: '2025-01-03', forecasted_price: 73.0 }
  ]
};

// Mock chart components since they access complex DOM APIs not in jsdom
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: any) => <div>{children}</div>,
  AreaChart: () => <div data-testid="chart" />,
  Area: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
  ReferenceLine: () => null,
}));

describe('Dashboard Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockData),
    });
  });

  it('renders correctly initial values', async () => {
    render(<Dashboard />);
    
    // Check loading state (animate-pulse)
    const pulses = document.querySelectorAll('.animate-pulse');
    expect(pulses.length).toBeGreaterThan(0);
    
    // Wait for data load
    await waitFor(() => {
        expect(screen.getByText(/Intelligence/i)).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('displays price update', async () => {
    render(<Dashboard />);
    
    await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled();
    });
  });
});
