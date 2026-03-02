import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import Home from './Home';

// Mock IntersectionObserver
class MockIntersectionObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
window.IntersectionObserver = MockIntersectionObserver as any;

describe('Home Component', () => {
  it('renders correctly', () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );
    
    // Check for main headline
    expect(screen.getByText(/Predict the Future/i)).toBeInTheDocument();
    expect(screen.getByText(/Crude Oil Markets/i)).toBeInTheDocument();
  });

  it('contains CTA buttons', () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );
    
    expect(screen.getByText(/Launch Dashboard/i)).toBeInTheDocument();
    expect(screen.getByText(/Learn Methodology/i)).toBeInTheDocument();
  });
});
