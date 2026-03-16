import { useDateConfig } from "../context/DateConfigContext";

/**
 * Hook for date utilities - provides common date operations
 */
export function useDateUtils() {
  const config = useDateConfig();

  return {
    /**
     * Format a single date
     * @param date - Date string or Date object
     * @param format - Format type: 'short', 'medium', 'long', 'longWithTime', 'timeOnly'
     */
    format: (date: string | Date, format: "short" | "medium" | "long" | "longWithTime" | "timeOnly" = "medium") =>
      config.formatDate(date, format),

    /**
     * Format a date range
     * @param startDate - Start date as string or Date
     * @param endDate - End date as string or Date
     * @param separator - Custom separator (default: " – ")
     */
    formatRange: (
      startDate: string | Date,
      endDate: string | Date,
      separator?: string
    ) => config.formatDateRange(startDate, endDate, separator),

    /**
     * Parse a date string to Date object
     */
    parse: (dateString: string) => config.parseDateString(dateString),

    /**
     * Get current date
     */
    now: () => new Date(),

    /**
     * Format current date
     */
    formatNow: (format: "short" | "medium" | "long" | "longWithTime" | "timeOnly" = "medium") =>
      config.formatDate(new Date(), format),

    /**
     * Get date from days ago
     */
    daysAgo: (days: number) => {
      const date = new Date();
      date.setDate(date.getDate() - days);
      return date;
    },

    /**
     * Check if date is today
     */
    isToday: (date: string | Date) => {
      const dateObj = typeof date === "string" ? new Date(date) : date;
      const today = new Date();
      return (
        dateObj.getFullYear() === today.getFullYear() &&
        dateObj.getMonth() === today.getMonth() &&
        dateObj.getDate() === today.getDate()
      );
    },

    /**
     * Check if date is in the past
     */
    isPast: (date: string | Date) => {
      const dateObj = typeof date === "string" ? new Date(date) : date;
      return dateObj < new Date();
    },

    /**
     * Check if date is in the future
     */
    isFuture: (date: string | Date) => {
      const dateObj = typeof date === "string" ? new Date(date) : date;
      return dateObj > new Date();
    },

    /**
     * Get days between two dates
     */
    daysBetween: (startDate: string | Date, endDate: string | Date) => {
      const start = typeof startDate === "string" ? new Date(startDate) : startDate;
      const end = typeof endDate === "string" ? new Date(endDate) : endDate;
      const diffTime = Math.abs(end.getTime() - start.getTime());
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    },

    /**
     * Get date in ISO format (YYYY-MM-DD)
     */
    toISODate: (date: string | Date) => {
      const dateObj = typeof date === "string" ? new Date(date) : date;
      return dateObj.toISOString().split("T")[0];
    },

    /**
     * Get filename-safe date string
     */
    toFilenameFormat: (date: string | Date) => {
      const dateObj = typeof date === "string" ? new Date(date) : date;
      const year = dateObj.getFullYear();
      const month = String(dateObj.getMonth() + 1).padStart(2, "0");
      const day = String(dateObj.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    },

    /**
     * Get locale and timezone info
     */
    getLocale: () => config.locale,
    getTimezone: () => config.timezone,
  };
}

/**
 * Standalone date utility functions (without context)
 * Use these when outside of a component context
 */
export const dateUtils = {
  /**
   * Format date without context
   */
  formatDate: (date: string | Date, locale = "en-US") => {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return "Invalid Date";
    return dateObj.toLocaleDateString(locale, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  },

  /**
   * Format date range without context
   */
  formatDateRange: (startDate: string | Date, endDate: string | Date, locale = "en-US") => {
    const start = typeof startDate === "string" ? new Date(startDate) : startDate;
    const end = typeof endDate === "string" ? new Date(endDate) : endDate;

    if (isNaN(start.getTime()) || isNaN(end.getTime())) return "Invalid Date Range";

    const startStr = start.toLocaleDateString(locale, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
    const endStr = end.toLocaleDateString(locale, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

    return `${startStr} – ${endStr}`;
  },

  /**
   * Get ISO date format
   */
  toISODate: (date: string | Date) => {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return dateObj.toISOString().split("T")[0];
  },

  /**
   * Get filename-safe date
   */
  toFilenameFormat: (date: string | Date) => {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, "0");
    const day = String(dateObj.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  },
};
