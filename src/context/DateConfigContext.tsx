import {
  createContext,
  useContext,
  useMemo,
  ReactNode,
} from "react";

/* ─── Date Format Options ──────────────────────────── */
export type DateFormatType = 
  | "short" 
  | "medium" 
  | "long" 
  | "longWithTime" 
  | "timeOnly";

export interface DateFormatOptions {
  locale?: string;
  timezone?: string;
}

export interface DateConfigContextValue {
  // Format functions
  formatDate: (date: string | Date, format?: DateFormatType) => string;
  formatDateRange: (startDate: string | Date, endDate: string | Date, separator?: string) => string;
  
  // Parse functions
  parseDateString: (dateString: string) => Date;
  
  // Configuration
  locale: string;
  timezone: string;
  dateFormat: Record<DateFormatType, Intl.DateTimeFormatOptions>;
}

/* ─── Default Date Formats ────────────────────────── */
const DEFAULT_DATE_FORMATS: Record<DateFormatType, Intl.DateTimeFormatOptions> = {
  short: {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  },
  medium: {
    year: "numeric",
    month: "short",
    day: "numeric",
  },
  long: {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  },
  longWithTime: {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
    hour: "2-digit",
    minute: "2-digit",
  },
  timeOnly: {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  },
};

/* ─── Context ──────────────────────────────────────── */
const DateConfigContext = createContext<DateConfigContextValue | null>(null);

export function useDateConfig(): DateConfigContextValue {
  const ctx = useContext(DateConfigContext);
  if (!ctx) throw new Error("useDateConfig must be used inside <DateConfigProvider>");
  return ctx;
}

interface DateConfigProviderProps {
  children: ReactNode;
  locale?: string;
  timezone?: string;
  dateFormats?: Partial<Record<DateFormatType, Intl.DateTimeFormatOptions>>;
}

/* ─── Provider Component ──────────────────────────── */
export function DateConfigProvider({
  children,
  locale = "en-US",
  timezone = Intl.DateTimeFormat().resolvedOptions().timeZone,
  dateFormats = {},
}: DateConfigProviderProps) {
  const mergedFormats = useMemo(
    () => ({ ...DEFAULT_DATE_FORMATS, ...dateFormats }),
    [dateFormats]
  );

  const value = useMemo<DateConfigContextValue>(() => {
    return {
      locale,
      timezone,
      dateFormat: mergedFormats,
      
      formatDate: (date: string | Date, format: DateFormatType = "medium"): string => {
        try {
          const dateObj = typeof date === "string" ? new Date(date) : date;
          if (isNaN(dateObj.getTime())) return "Invalid Date";
          
          return dateObj.toLocaleDateString(locale, {
            ...mergedFormats[format],
            timeZone: timezone,
          });
        } catch {
          return "Invalid Date";
        }
      },

      formatDateRange: (
        startDate: string | Date,
        endDate: string | Date,
        separator: string = " – "
      ): string => {
        try {
          const start = typeof startDate === "string" ? new Date(startDate) : startDate;
          const end = typeof endDate === "string" ? new Date(endDate) : endDate;

          if (isNaN(start.getTime()) || isNaN(end.getTime())) return "Invalid Date Range";

          const startStr = start.toLocaleDateString(locale, {
            ...mergedFormats.medium,
            timeZone: timezone,
          });
          const endStr = end.toLocaleDateString(locale, {
            ...mergedFormats.medium,
            timeZone: timezone,
          });

          return `${startStr}${separator}${endStr}`;
        } catch {
          return "Invalid Date Range";
        }
      },

      parseDateString: (dateString: string): Date => {
        // Try ISO format first
        const date = new Date(dateString);
        if (!isNaN(date.getTime())) return date;
        
        // Try common formats
        const formats = [
          /(\d{1,2})\/(\d{1,2})\/(\d{4})/,
          /(\d{4})-(\d{1,2})-(\d{1,2})/,
        ];

        for (const format of formats) {
          const match = dateString.match(format);
          if (match) {
            if (match[3].length === 4) {
              const [, m, d, y] = match;
              return new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
            }
          }
        }

        throw new Error(`Unable to parse date string: ${dateString}`);
      },
    };
  }, [locale, timezone, mergedFormats]);

  return (
    <DateConfigContext.Provider value={value}>
      {children}
    </DateConfigContext.Provider>
  );
}
