# FYP Frontend - Project Analysis and Working Guide

## 1. What This Project Does

This project is a React + TypeScript frontend for an AI-based Brent crude oil forecasting platform called PetroCast.

It provides:
- A landing experience that explains the platform and directs users to core features.
- A live dashboard for:
  - Next-day and short-horizon price forecasts.
  - Probabilistic fan-chart forecasts.
  - Historical Brent price exploration.
  - Predicted vs actual analytics over a selected date range.
- A news module to browse market-relevant articles by recent date buckets or a specific date.
- An about/methodology section describing the project pipeline, capabilities, and tech stack.
- A performance monitor page for Core Web Vitals and page-load metrics.

In short: this frontend helps users interpret model outputs and supporting market context through interactive visual analytics.

## 2. Core User Flows

1. User opens the app and lands on Home.
2. User navigates to Dashboard and sees:
   - Current Brent price.
   - Forecast trajectory and forecast table.
   - Historical series loaded progressively.
   - Analytics comparison metrics (MAE, RMSE, MAPE, compared days).
3. User can refresh all dashboard data at once.
4. User can export historical data to CSV.
5. User can open News and filter by days or exact date.
6. User can review methodology in About.

## 3. How It Works (Architecture)

### Frontend Stack
- React 18 + TypeScript
- Vite for dev/build tooling
- React Router for page routing
- Tailwind CSS v4 for utility-first styling
- Ant Design for selected UI components (tables, pagination, cards, metrics)
- Recharts for charts
- Framer Motion for animation

### Runtime Composition
- App entry is in src/main.tsx.
- Routing and providers are composed in src/App.tsx.
- Global wrappers:
  - DateConfigProvider for unified date formatting/parsing.
  - NotificationProvider for toast-style user notifications.
- Shared navigation and footer frame all route pages.

### Route Map
- / -> Home
- /dashboard -> Dashboard
- /news -> News
- /about -> About
- /performance -> Performance monitor

## 4. Data Layer and API Integration

The API client lives in src/api/index.ts.

Base backend URL:
- https://pramudithan-oil-price-prediction.hf.space

Endpoints consumed:
- /predict -> point forecasts and latest price context.
- /predictions/fan -> probabilistic fan forecast bands.
- /predictions/compare?start_date=...&end_date=... -> predicted vs actual comparison metrics and points.
- /historical/prices?limit=...&offset=... -> paginated historical price records.
- /news (optional query: days or article_date) -> news feed payload.

Important implementation details:
- Historical data is fetched page-by-page and merged progressively so the UI can render partial results quickly.
- Historical rows are deduplicated by date and sorted to maintain stable timeline order.
- News payload normalization is defensive: it supports multiple possible backend response shapes.
- API response typings are centralized in src/types/api.ts.

## 5. Dashboard Internals

Dashboard (src/components/Dashboard.tsx) has three functional tabs:

1. Forecast tab
- Uses /predict data.
- Shows KPI cards, trajectory chart, price-range bar, and forecast table.
- Uses fan chart data from /predictions/fan.

2. Historical tab
- Uses progressive /historical/prices loading.
- Shows loading progress and dataset coverage.
- Enables CSV export with date-window based filename.

3. Analytics tab
- Uses /predictions/compare with start/end date.
- Validates date input before request.
- Displays accuracy metrics and comparison visualizations.

UX/behavior notes:
- Initial data calls are guarded to avoid duplicate fetches in React StrictMode.
- Notifications are emitted for success/failure/warning states.
- Date presentation is standardized through the date config utilities.

## 6. Date and Notification Systems

### Date Config
- Context: src/context/DateConfigContext.tsx
- Hook/utilities: src/utils/dateUtils.ts
- Supports reusable formats: short, medium, long, longWithTime, timeOnly.
- Centralizes locale/timezone-aware formatting and range formatting.

### Notifications
- Context: src/context/NotificationContext.tsx
- Exposes notify({ type, title, message, duration }).
- Renders animated toast stack with auto-dismiss and manual close.

## 7. Performance Monitoring

- Auto-initialized from src/main.tsx via initPerformanceMonitoring().
- Utility implementation: src/utils/performance.ts.
- Tracks browser performance metrics such as LCP, FID, CLS, FCP, TTFB, plus load timings.
- Optional UI dashboard route at /performance presents metric status against thresholds.

## 8. Testing and Quality

### Unit/Component Testing
- Test runner: Vitest + Testing Library + jsdom
- Test setup file: src/test/setup.ts
- Examples:
  - src/components/Home.test.tsx
  - src/components/Dashboard.test.tsx

### Coverage
- Coverage output generated under coverage/.
- LCOV report path configured for static analysis tools.

### Static Analysis
- SonarCloud config in sonar-project.properties.
- Source target is src/ with standard exclusions for build artifacts/tests.

## 9. Load Testing

The repository includes k6 scripts in load-tests/:
- basic-load-test.js
- stress-test.js
- spike-test.js
- soak-test.js

NPM scripts are provided to run local and production-targeted scenarios.

## 10. Build, Run, and Scripts

Main commands:
- npm run dev -> start Vite dev server
- npm run build -> TypeScript compile + production build
- npm run preview -> preview production build
- npm run lint -> ESLint checks
- npm run test -> Vitest
- npm run test:coverage -> coverage run

Load test commands:
- npm run load-test:local
- npm run load-test:prod
- npm run load-test:stress
- npm run load-test:spike
- npm run load-test:soak

## 11. Deployment Notes

- Vercel SPA rewrite is configured in vercel.json to route all paths to index.html.
- This ensures React Router deep links work in production.

## 12. Project Structure Summary

High-level folders:
- src/components -> page and reusable UI components
- src/api -> API client and data-fetch helpers
- src/context -> global app contexts (date config, notifications)
- src/types -> TypeScript API contracts
- src/utils -> utility modules (date and performance)
- load-tests -> k6 performance scripts
- coverage -> generated test coverage reports

## 13. Current Functional Scope (Practical Summary)

The app is currently a complete frontend client for:
- Visualizing short-term Brent price forecasts.
- Comparing predicted vs actual outcomes with key error metrics.
- Exploring historical market data with export capability.
- Following related market news.
- Presenting methodology and technical context.
- Monitoring frontend performance metrics.

This makes it suitable for research demos, stakeholder walkthroughs, and iterative model-frontend integration work.
