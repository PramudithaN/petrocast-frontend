# DateConfig Component Usage Guide

## Overview
The DateConfig system provides centralized, consistent date handling throughout the fyp_frontend project. It includes:

- **DateConfigContext**: React context for global date configuration
- **useDateUtils**: Hook for date operations with access to global config
- **dateUtils**: Standalone utilities for date operations (outside React components)

## Setup (Already Configured)

The app is already wrapped with DateConfigProvider in [App.tsx](App.tsx):

```tsx
<DateConfigProvider locale="en-US">
  <NotificationProvider>
    {/* Your app content */}
  </NotificationProvider>
</DateConfigProvider>
```

## Usage Examples

### 1. In React Components

Import the hook and use it:

```tsx
import { useDateUtils } from "../utils/dateUtils";

function MyComponent() {
  const dateUtils = useDateUtils();

  return (
    <div>
      {/* Format a single date */}
      <p>{dateUtils.format("2026-03-17", "medium")}</p>
      {/* Output: Mar 17, 2026 */}

      {/* Format a date range */}
      <p>{dateUtils.formatRange("2026-01-01", "2026-03-17")}</p>
      {/* Output: Jan 1, 2026 – Mar 17, 2026 */}

      {/* Get ISO format for filenames */}
      <p>{dateUtils.toISODate("2026-03-17")}</p>
      {/* Output: 2026-03-17 */}

      {/* Check date relationships */}
      {dateUtils.isToday("2026-03-17") && <p>Today!</p>}
      {dateUtils.isPast("2026-03-17") && <p>In the past</p>}
      {dateUtils.isFuture("2026-03-17") && <p>In the future</p>}

      {/* Get days between dates */}
      <p>Days between: {dateUtils.daysBetween("2026-01-01", "2026-03-17")}</p>

      {/* Get days ago */}
      <p>{dateUtils.format(dateUtils.daysAgo(7), "medium")}</p>
    </div>
  );
}
```

### 2. Format Types

Available format types for `dateUtils.format()`:

```tsx
"short"        // 03/17/2026
"medium"       // Mar 17, 2026 (default)
"long"         // March 17, 2026, Tuesday
"longWithTime" // March 17, 2026, Tuesday, 14:30
"timeOnly"     // 02:30:45 PM
```

### 3. In Dashboard Component

The Dashboard component has been fully integrated:

```tsx
// Date range in notifications
message: `${partial.total_records.toLocaleString()} records loaded (${dateUtils.formatRange(partial.date_range.start, partial.date_range.end)})`

// CSV export filenames
const startDate = dateUtils.toISODate(historicalData.date_range.start);
const endDate = dateUtils.toISODate(historicalData.date_range.end);
a.download = `brent-crude-historical-${startDate}-${endDate}.csv`;

// Chart data
date: dateUtils.format(f.date, "short"),

// Table column rendering
{dateUtils.format(date, "medium")}
```

### 4. Standalone Usage (No Component Context)

Use `dateUtils` object for operations outside React components:

```tsx
import { dateUtils } from "../utils/dateUtils";

// These work without React context
const formatted = dateUtils.formatDate("2026-03-17");
const range = dateUtils.formatDateRange("2026-01-01", "2026-03-17");
const isoDate = dateUtils.toISODate("2026-03-17");
const filename = dateUtils.toFilenameFormat("2026-03-17");
```

## Component Hierarchy

All components have access to date utilities through the context:

```
App.tsx (DateConfigProvider)
├── ConfigProvider (Ant Design)
│   └── DateConfigProvider (Global date config)
│       └── NotificationProvider
│           ├── Navbar
│           ├── Dashboard (uses useDateUtils)
│           ├── News
│           ├── About
│           ├── Home
│           ├── PerformanceMonitor
│           └── Footer
```

## Customization

To customize date formatting globally, update DateConfigProvider in App.tsx:

```tsx
<DateConfigProvider 
  locale="en-GB"  // Change locale
  timezone="Europe/London"  // Change timezone
  dateFormats={{
    medium: {
      year: "2-digit",
      month: "2-digit", 
      day: "2-digit"
    }
  }}
>
```

## Default Configuration

- **Locale**: en-US
- **Timezone**: Browser's default timezone
- **Formats**: Predefined set in DateConfigContext

## Key Methods Reference

```tsx
// Formatting
format(date, format?)              // Format single date
formatRange(start, end, separator) // Format date range
toISODate(date)                   // Get YYYY-MM-DD format
toFilenameFormat(date)            // Get filename-safe format

// Parsing
parse(dateString)                 // Parse string to Date

// Checking
isToday(date)                     // Check if today
isPast(date)                      // Check if in past
isFuture(date)                    // Check if in future

// Calculations
daysAgo(count)                    // Get date N days ago
daysBetween(start, end)           // Count days between dates
now()                             // Get current date
formatNow(format?)                // Format current date

// Info
getLocale()                       // Get current locale
getTimezone()                     // Get current timezone
```

## Files Modified

1. **Created**: [src/context/DateConfigContext.tsx](src/context/DateConfigContext.tsx)
2. **Created**: [src/utils/dateUtils.ts](src/utils/dateUtils.ts)
3. **Updated**: [src/App.tsx](src/App.tsx) - Added DateConfigProvider
4. **Updated**: [src/components/Dashboard.tsx](src/components/Dashboard.tsx) - Uses dateUtils throughout

## Testing

The system is fully integrated and tested via:
- TypeScript compilation (`npm run build`)
- Vite build process
- Component rendering in development

Start development server to see it in action:
```bash
npm run dev
```

Navigate to `/dashboard` to see dates being formatted and used throughout the application.
