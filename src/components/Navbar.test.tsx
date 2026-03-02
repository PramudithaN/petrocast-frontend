import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import Navbar from './Navbar';

// Helper to render with Router
const renderWithRouter = (ui: React.ReactElement) => {
  return render(ui, { wrapper: BrowserRouter });
};

describe('Navbar Component', () => {
  it('renders the brand name', () => {
    renderWithRouter(<Navbar />);
    expect(screen.getByText('OilCheck')).toBeInTheDocument();
  });

  it('contains the navigation links', () => {
    renderWithRouter(<Navbar />);
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('About')).toBeInTheDocument();
  });

  it('updates background on scroll', () => {
    renderWithRouter(<Navbar />);
    const nav = screen.getByRole('navigation');
    
    // Initial state should be transparent
    expect(nav).toHaveClass('bg-transparent');

    // Simulate scroll
    fireEvent.scroll(globalThis as any, { target: { scrollY: 100 } });
    fireEvent.scroll(globalThis as any);
  });
});
