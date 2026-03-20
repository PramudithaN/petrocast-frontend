import { useState, useEffect, useRef, useCallback } from "react";
import { Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  FanResponse,
  HistoricalPricesResponse,
  PredictionComparisonResponse,
  PredictionResponse,
} from "../types/api";
import {
  fetchFanPredictions as fetchFanPredictionsApi,
  fetchHistoricalPricesProgressive as fetchHistoricalPricesProgressiveApi,
  fetchPredictionComparison as fetchPredictionComparisonApi,
  fetchPredictions as fetchPredictionsApi,
} from "../api";
import {
  AreaChart,
  Area,
  Bar,
  BarChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  LineChart,
  Line,
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  RefreshCw,
  Activity,
  Gauge,
  Radio,
  AlertTriangle,
  Clock,
  Download,
} from "lucide-react";
import CountUp from "react-countup";
import AnimatedButton from "./ui/AnimatedButton";
import FanChart from "./FanChart";
import { useNotification } from "../context/NotificationContext";
import { useDateUtils } from "../utils/dateUtils";

/* ─── Skeleton Loader ─── */
const Skeleton = ({ className = "" }: { className?: string }) => (
  <div className={`animate-pulse rounded-xl bg-white/5 ${className}`} />
);

const parseFiniteNumber = (value: unknown): number | null => {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return null;

    const parsed = Number(trimmed);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
};

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);

// Guard against backend sentinel/outlier values that should not be charted as prices.
const isValidOilPrice = (value: unknown): value is number =>
  isFiniteNumber(value) && value > 0 && value < 10000;

const formatFixed = (
  value: number | null | undefined,
  digits = 2,
  fallback = "0.00",
): string => (isFiniteNumber(value) ? value.toFixed(digits) : fallback);

const formatCurrency = (
  value: number | null | undefined,
  digits = 2,
  fallback = "0.00",
): string => `$${formatFixed(value, digits, fallback)}`;

const SkeletonDashboard = () => (
  <div className="px-4 sm:px-6 md:px-8 lg:px-10 pt-24 pb-8 space-y-8 max-w-[1600px] mx-auto min-h-screen">
    <div className="flex flex-col md:flex-row justify-between gap-6 pb-6 border-b border-white/5">
      <div className="space-y-3">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-9 w-72" />
        <Skeleton className="h-4 w-48" />
      </div>
      <Skeleton className="h-12 w-44 rounded-xl" />
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map((cardNum) => (
        <Skeleton key={cardNum} className="h-36 rounded-2xl" />
      ))}
    </div>
    <Skeleton className="h-[450px] rounded-3xl" />
    <Skeleton className="h-64 rounded-3xl" />
  </div>
);

/* ─── Sentiment Gauge ─── */
const SentimentGauge = ({ value }: { value: number }) => {
  const isPositive = value >= 0;
  const label = Math.abs(value) > 1 ? "Strong" : "Mild";
  const sentiment = isPositive ? `${label} Bullish` : `${label} Bearish`;
  const color = isPositive ? "#10B981" : "#EF4444";

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-20 h-20">
        <svg viewBox="0 0 80 80" className="w-full h-full -rotate-90">
          <circle
            cx="40"
            cy="40"
            r="34"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth="6"
            fill="none"
          />
          <motion.circle
            cx="40"
            cy="40"
            r="34"
            stroke={color}
            strokeWidth="6"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={`${Math.min(Math.abs(value) * 30, 213)} 213`}
            initial={{ strokeDasharray: "0 213" }}
            animate={{
              strokeDasharray: `${Math.min(Math.abs(value) * 30, 213)} 213`,
            }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <Gauge size={20} style={{ color }} />
        </div>
      </div>
      <span
        className="text-xs font-semibold uppercase tracking-wider"
        style={{ color }}
      >
        {sentiment}
      </span>
    </div>
  );
};

/* ─── Custom Chart Tooltip ─── */
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const value = parseFiniteNumber(payload[0]?.value);
  const displayValue =
    value === null ? String(payload[0]?.value ?? "-") : formatCurrency(value);

  return (
    <div className="glass-strong p-4 rounded-xl shadow-2xl min-w-[160px]">
      <p className="text-xs text-gray-400 mb-2">{label}</p>
      <p className="text-xl font-bold text-oil-gold font-display">{displayValue}</p>
      <p className="text-xs text-gray-500 mt-1">
        {payload[0]?.payload?.type === "Historical" ? "● Actual" : "◐ Forecast"}
      </p>
    </div>
  );
};

const AnalyticsTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;

  const point = payload[0]?.payload;
  if (!point) return null;

  return (
    <div className="glass-strong p-4 rounded-xl shadow-2xl min-w-[220px]">
      <p className="text-xs text-gray-400 mb-3">{label}</p>
      <div className="space-y-2 text-xs">
        <div className="flex items-center justify-between gap-4">
          <span className="text-gray-500">Actual</span>
          <span className="font-mono text-oil-cyan">{formatCurrency(point.actualPrice)}</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-gray-500">Predicted</span>
          <span className="font-mono text-oil-gold">{formatCurrency(point.predictedPrice)}</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-gray-500">Absolute Error</span>
          <span className="font-mono text-white">{formatCurrency(point.absoluteError)}</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-gray-500">Prediction Count</span>
          <span className="font-mono text-gray-300">{point.predictionCount}</span>
        </div>
      </div>
    </div>
  );
};

const DEFAULT_ANALYTICS_START_DATE = "2026-01-01";
const getTodayDateInputValue = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const DEFAULT_ANALYTICS_END_DATE = getTodayDateInputValue();

type DashboardTab = "forecast" | "historical" | "analytics";
type DashboardNotificationScope =
  | "forecast"
  | "historical"
  | "analytics"
  | "fan";

const NOTIFICATION_SCOPE_TO_TAB: Record<DashboardNotificationScope, DashboardTab> = {
  forecast: "forecast",
  historical: "historical",
  analytics: "analytics",
  fan: "analytics",
};

function Dashboard() {
  const [activeTab, setActiveTab] = useState<DashboardTab>("forecast");
  const [data, setData] = useState<PredictionResponse | null>(null);
  const [historicalData, setHistoricalData] =
    useState<HistoricalPricesResponse | null>(null);
  const [fanData, setFanData] = useState<FanResponse | null>(null);
  const [analyticsData, setAnalyticsData] =
    useState<PredictionComparisonResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [historicalLoading, setHistoricalLoading] = useState<boolean>(true);
  const [analyticsLoading, setAnalyticsLoading] = useState<boolean>(true);
  const [historicalProgress, setHistoricalProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [historicalError, setHistoricalError] = useState<string | null>(null);
  const [analyticsError, setAnalyticsError] = useState<string | null>(null);
  const [analyticsStartDate, setAnalyticsStartDate] =
    useState<string>(DEFAULT_ANALYTICS_START_DATE);
  const [analyticsEndDate, setAnalyticsEndDate] =
    useState<string>(DEFAULT_ANALYTICS_END_DATE);
  const [refreshing, setRefreshing] = useState(false);
  const { notify } = useNotification();
  const dateUtils = useDateUtils();
  // Guards against React StrictMode double-invocation firing the initial fetches twice.
  const initialFetchDone = useRef(false);
  const pendingNotifications = useRef<
    Partial<Record<DashboardNotificationScope, Parameters<typeof notify>[0]>>
  >({});

  const flushNotificationsForTab = useCallback(
    (tab: DashboardTab) => {
      const queuedScopes = Object.entries(pendingNotifications.current).filter(
        ([scope]) =>
          NOTIFICATION_SCOPE_TO_TAB[scope as DashboardNotificationScope] === tab,
      ) as Array<[DashboardNotificationScope, Parameters<typeof notify>[0]]>;

      if (!queuedScopes.length) return;

      queuedScopes.forEach(([scope, notification]) => {
        delete pendingNotifications.current[scope];
        notify(notification);
      });
    },
    [notify],
  );

  const notifyForTab = useCallback(
    (scope: DashboardNotificationScope, notification: Parameters<typeof notify>[0]) => {
      const targetTab = NOTIFICATION_SCOPE_TO_TAB[scope];
      if (activeTab === targetTab) {
        notify(notification);
        return;
      }

      pendingNotifications.current[scope] = notification;
    },
    [activeTab, notify],
  );

  useEffect(() => {
    flushNotificationsForTab(activeTab);
  }, [activeTab, flushNotificationsForTab]);

  useEffect(() => {
    if (initialFetchDone.current) return;
    initialFetchDone.current = true;
    fetchPredictions();
    fetchFan();
    fetchHistoricalPrices();
    fetchPredictionComparison(
      DEFAULT_ANALYTICS_START_DATE,
      DEFAULT_ANALYTICS_END_DATE,
    );
  }, []);

  const fetchPredictions = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchPredictionsApi();
      setData(result);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to fetch predictions";
      setError(msg);
      notifyForTab("forecast", {
        type: "error",
        title: "Forecast failed",
        message: msg,
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchFan = async () => {
    try {
      const result = await fetchFanPredictionsApi();
      setFanData(result);
      notifyForTab("fan", {
        type: "info",
        title: "Fan chart ready",
        message: `${result.fan.length} probabilistic data points loaded`,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Fan chart data unavailable";
      notifyForTab("fan", {
        type: "warning",
        title: "Fan chart unavailable",
        message: msg,
      });
    }
  };

  const fetchHistoricalPrices = async () => {
    try {
      setHistoricalLoading(true);
      setHistoricalError(null);
      setHistoricalProgress(0);
      let isFirstPage = true;
      await fetchHistoricalPricesProgressiveApi((partial, progress) => {
        setHistoricalData(partial);
        setHistoricalProgress(progress);
        if (isFirstPage) {
          setHistoricalLoading(false);
          isFirstPage = false;
        }
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to fetch historical prices";
      setHistoricalError(msg);
      notifyForTab("historical", {
        type: "error",
        title: "Historical data failed",
        message: msg,
      });
      setHistoricalLoading(false);
    }
  };

  const fetchPredictionComparison = async (
    startDate = analyticsStartDate,
    endDate = analyticsEndDate,
  ) => {
    if (!startDate || !endDate) {
      const msg = "Select both a start and end date to load analytics";
      setAnalyticsError(msg);
      notifyForTab("analytics", {
        type: "warning",
        title: "Analytics dates missing",
        message: msg,
      });
      return;
    }

    if (startDate > endDate) {
      const msg = "Start date must be earlier than or equal to end date";
      setAnalyticsError(msg);
      notifyForTab("analytics", {
        type: "warning",
        title: "Invalid date range",
        message: msg,
      });
      return;
    }

    try {
      setAnalyticsLoading(true);
      setAnalyticsError(null);
      const result = await fetchPredictionComparisonApi(startDate, endDate);
      setAnalyticsData(result);
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : "Failed to fetch predicted vs actual comparison";
      setAnalyticsError(msg);
      notifyForTab("analytics", {
        type: "error",
        title: "Analytics failed",
        message: msg,
      });
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      fetchPredictions(),
      fetchFan(),
      fetchHistoricalPrices(),
      fetchPredictionComparison(analyticsStartDate, analyticsEndDate),
    ]);
    setTimeout(() => setRefreshing(false), 500);
  };

  const downloadHistoricalCSV = () => {
    if (!historicalData?.data.length) return;

    const header = "Date,Close,Open,High,Low,Volume,Change %";
    const rows = historicalData.data.map((row) =>
      [
        row.date,
        row.price,
        row.open,
        row.high,
        row.low,
        row.volume ?? "",
        row.change_pct,
      ].join(","),
    );
    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const startDateFormatted = dateUtils.toISODate(historicalData.date_range.start);
    const endDateFormatted = dateUtils.toISODate(historicalData.date_range.end);
    a.download = `brent-crude-historical-${startDateFormatted}-${endDateFormatted}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatPrice = (price: number): string => price.toFixed(2);

  if (loading && !data) return <SkeletonDashboard />;

  if (error) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-oil-black p-8 pt-32">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass p-10 rounded-3xl max-w-lg w-full text-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-6">
            <AlertTriangle size={32} className="text-red-400" />
          </div>
          <h2 className="text-xl font-bold text-white mb-3 font-display">
            Connection Error
          </h2>
          <p className="text-gray-400 text-sm mb-8 leading-relaxed">{error}</p>
          <AnimatedButton
            variant="primary"
            onClick={fetchPredictions}
            hoverScale={1.03}
            className="px-6 py-3 rounded-xl text-sm"
          >
            Retry Connection
          </AnimatedButton>
        </motion.div>
      </div>
    );
  }

  if (!data) return null;

  const validForecasts = data.forecasts.filter((forecast) =>
    isValidOilPrice(forecast.forecasted_price),
  );

  const priceChange =
    validForecasts.length > 0
      ? validForecasts[0].forecasted_price - data.last_price
      : 0;
  const priceChangePercent =
    data.last_price > 0 ? (priceChange / data.last_price) * 100 : 0;
  const isPositive = priceChange >= 0;
  const isMarketRunning = data.is_market_open ?? false;

  // Chart data
  const chartData = [
    {
      date: dateUtils.format(data.last_price_date, "short"),
      price: data.last_price,
      type: "Historical",
    },
    ...validForecasts.map((f) => ({
      date: dateUtils.format(f.date, "short"),
      price: f.forecasted_price,
      type: "Forecast",
    })),
  ];
  
  const tableData = validForecasts.map((forecast, index) => ({
    ...forecast,
    key: index,
    changeFromCurrent: forecast.forecasted_price - data.last_price,
    changePercent:
      ((forecast.forecasted_price - data.last_price) / data.last_price) * 100,
  }));

  const columns: ColumnsType<any> = [
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      render: (date: string) => (
        <span className="text-gray-300 flex items-center gap-2">
          <Calendar size={14} className="text-gray-500" />
          {dateUtils.format(date, "medium")}
        </span>
      ),
    },
    {
      title: "Forecasted Price",
      dataIndex: "forecasted_price",
      key: "forecasted_price",
      render: (price: number) => (
        <span className="font-mono font-bold text-oil-gold text-base">
          ${formatPrice(price)}
        </span>
      ),
    },
    {
      title: "Daily Return",
      dataIndex: "forecasted_return",
      key: "forecasted_return",
      render: (val: number) => (
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold ${
            val >= 0
              ? "bg-emerald-500/10 text-emerald-400"
              : "bg-red-500/10 text-red-400"
          }`}
        >
          {val >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          {(val * 100).toFixed(3)}%
        </span>
      ),
    },
    {
      title: "Change from Current",
      dataIndex: "changeFromCurrent",
      key: "changeFromCurrent",
      render: (val: number) => (
        <div
          className={`flex items-center gap-1.5 font-medium ${
            val >= 0 ? "text-emerald-400" : "text-red-400"
          }`}
        >
          {val >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
          <span className="font-mono">${Math.abs(val).toFixed(2)}</span>
          <span className="text-xs opacity-60">
            ({val >= 0 ? "+" : ""}
            {((val / data.last_price) * 100).toFixed(2)}%)
          </span>
        </div>
      ),
    },
  ];

  // Price range for chart
  const allPrices = chartData.map((d) => d.price);
  const minPrice = Math.min(...allPrices);
  const maxPrice = Math.max(...allPrices);
  const priceRange = maxPrice - minPrice;
  const safePriceRange = priceRange > 0 ? priceRange : Math.max(maxPrice * 0.05, 1);

  const historicalChartData = (historicalData?.data ?? []).map((item) => ({
    date: dateUtils.format(item.date, "short"),
    price: item.price,
    open: item.open,
    high: item.high,
    low: item.low,
    changePct: item.change_pct,
    rawDate: item.date,
  }));

  const historicalPriceValues = historicalChartData.map((d) => d.price);
  const historicalMinPrice = historicalPriceValues.length
    ? Math.min(...historicalPriceValues)
    : 0;
  const historicalMaxPrice = historicalPriceValues.length
    ? Math.max(...historicalPriceValues)
    : 0;
  const historicalPriceRange = historicalMaxPrice - historicalMinPrice;
  const historicalRecordsLoaded = historicalData?.total_records ?? 0;
  const historicalRecordsAvailable = historicalData?.total_available ?? 0;
  const historicalCoverage = historicalRecordsAvailable
    ? (historicalRecordsLoaded / historicalRecordsAvailable) * 100
    : 0;
  const historicalStartDate = historicalData?.date_range?.start
    ? dateUtils.format(historicalData.date_range.start, "medium")
    : "-";
  const historicalEndDate = historicalData?.date_range?.end
    ? dateUtils.format(historicalData.date_range.end, "medium")
    : "-";
  const analyticsChartData = (analyticsData?.comparison ?? []).map((item) => ({
    date: dateUtils.format(item.date, "short"),
    actualPrice: item.actual_price,
    predictedPrice: item.predicted_price,
    medianPrice: item.predicted_price_median,
    latestPrice: item.predicted_price_latest,
    absoluteError: item.abs_error,
    percentError: item.abs_pct_error,
    predictionCount: item.prediction_count,
    rawDate: item.date,
  }));
  const analyticsPriceValues = analyticsChartData.flatMap((item) =>
    [item.actualPrice, item.predictedPrice].filter(isFiniteNumber),
  );
  const analyticsMinPrice = analyticsPriceValues.length
    ? Math.min(...analyticsPriceValues)
    : 0;
  const analyticsMaxPrice = analyticsPriceValues.length
    ? Math.max(...analyticsPriceValues)
    : 0;
  const analyticsPriceRange = analyticsMaxPrice - analyticsMinPrice;
  const analyticsMetrics = analyticsData?.metrics;

  return (
    <div className="px-4 sm:px-6 md:px-8 lg:px-10 pt-24 pb-8 space-y-8 max-w-[1600px] mx-auto min-h-screen bg-oil-black">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/5"
      >
        <div>
          <div className="flex items-center gap-2 text-oil-gold/80 text-xs mb-2 font-semibold tracking-widest uppercase">
            <motion.div
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Activity size={14} />
            </motion.div>
            <span>Market Intelligence</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight font-display flex items-center gap-4">
            Brent Crude Oil{' '}
            <span className="text-lg text-gray-500 font-normal font-sans">
              BZ=F
            </span>
          </h1>
          <p className="text-gray-500 mt-2 flex items-center gap-2 text-sm">
            <Clock size={14} />
            Last Updated:{" "}
            <span className="text-gray-300 font-medium">
              {dateUtils.format(data.last_price_date, "medium")}
            </span>
          </p>
          <p className="text-gray-500 mt-2 flex items-center gap-2 text-sm">
            <Radio size={14} />
            Market Status:{" "}
            <span
              className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${
                isMarketRunning
                  ? "bg-emerald-500/10 text-emerald-400"
                  : "bg-red-500/10 text-red-400"
              }`}
            >
              <motion.span
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className={`w-1.5 h-1.5 rounded-full ${
                  isMarketRunning
                    ? "bg-emerald-400"
                    : "bg-red-400"
                }`}
              />
              {isMarketRunning ? "Open" : "Closed"}
            </span>
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleRefresh}
          disabled={refreshing}
          className={`group flex items-center gap-3 px-6 py-3 glass hover:border-oil-gold/30 rounded-xl text-white font-medium transition-all duration-300 disabled:opacity-50 ${refreshing ? "cursor-not-allowed" : "cursor-pointer"}`}
        >
          <RefreshCw
            size={18}
            className={`transition-transform duration-700 ${
              refreshing ? "animate-spin" : "group-hover:rotate-180"
            }`}
          />
          <span>{refreshing ? "Refreshing..." : "Refresh Data"}</span>
        </motion.button>
      </motion.div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => setActiveTab("forecast")}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 cursor-pointer ${
            activeTab === "forecast"
              ? "bg-oil-gold/20 text-oil-gold border border-oil-gold/40"
              : "bg-white/5 text-gray-400 border border-white/10 hover:text-white"
          }`}
        >
          Forecast
        </button>
        <button
          onClick={() => setActiveTab("historical")}
          className={`px-4 py-2 rounded-lg text-sm font-semibold uppercase transition-all duration-300 cursor-pointer ${
            activeTab === "historical"
              ? "bg-oil-blue/20 text-oil-cyan border border-oil-cyan/40"
              : "bg-white/5 text-gray-400 border border-white/10 hover:text-white"
          }`}
        >
          Historical Data
        </button>
        <button
          onClick={() => setActiveTab("analytics")}
          className={`px-4 py-2 rounded-lg text-sm font-semibold uppercase transition-all duration-300 cursor-pointer ${
            activeTab === "analytics"
              ? "bg-emerald-500/15 text-emerald-300 border border-emerald-400/40"
              : "bg-white/5 text-gray-400 border border-white/10 hover:text-white"
          }`}
        >
          Analytics
        </button>
      </div>

      {activeTab === "forecast" && (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <AnimatePresence>
              {/* Current Price */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="glass p-6 rounded-2xl group hover:border-oil-gold/20 transition-all duration-500"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider">
                    Current Price
                  </span>
                  <div className="p-2 rounded-xl bg-oil-gold/10">
                    <DollarSign size={16} className="text-oil-gold" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-white font-display">
                  $
                  <CountUp
                    end={data.last_price}
                    decimals={2}
                    duration={1.5}
                    preserveValue
                  />
                </div>
                <div className="mt-2 text-xs text-gray-500">Brent Crude Oil</div>
              </motion.div>

              {/* Forecast Change */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="glass p-6 rounded-2xl group hover:border-oil-gold/20 transition-all duration-500"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider">
                    Next Day Change
                  </span>
                  <div
                    className={`p-2 rounded-xl ${
                      isPositive ? "bg-emerald-500/10" : "bg-red-500/10"
                    }`}
                  >
                    {isPositive ? (
                      <TrendingUp size={16} className="text-emerald-400" />
                    ) : (
                      <TrendingDown size={16} className="text-red-400" />
                    )}
                  </div>
                </div>
                <div
                  className={`text-3xl font-bold font-display ${
                    isPositive ? "text-emerald-400" : "text-red-400"
                  }`}
                >
                  {isPositive ? "+" : ""}
                  <CountUp
                    end={priceChange}
                    decimals={2}
                    duration={1.5}
                    prefix="$"
                    preserveValue
                  />
                </div>
                <div className="mt-2 text-xs">
                  <span
                    className={`${isPositive ? "text-emerald-400/80" : "text-red-400/80"}`}
                  >
                    {isPositive ? "+" : ""}
                    {priceChangePercent.toFixed(2)}%
                  </span>
                  <span className="text-gray-600 ml-1">from current</span>
                </div>
              </motion.div>

              {/* Forecast Horizon */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="glass p-6 rounded-2xl group hover:border-oil-gold/20 transition-all duration-500"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider">
                    Forecast Horizon
                  </span>
                  <div className="p-2 rounded-xl bg-blue-500/10">
                    <Calendar size={16} className="text-blue-400" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-white font-display">
                  <CountUp
                    end={validForecasts.length}
                    duration={1}
                    preserveValue
                  />
                  <span className="text-lg text-gray-500 font-normal ml-2">
                    Days
                  </span>
                </div>
                <div className="mt-2 text-xs text-gray-500">Trading days ahead</div>
              </motion.div>

              {/* Sentiment */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="glass p-6 rounded-2xl group hover:border-oil-gold/20 transition-all duration-500"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider">
                    Market Sentiment
                  </span>
                </div>
                <SentimentGauge value={priceChangePercent} />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Main Chart */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="glass p-6 md:p-8 rounded-3xl"
          >
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg font-bold text-white font-display flex items-center gap-3">
                <div className="w-1 h-6 rounded-full bg-gradient-to-b from-oil-gold to-oil-amber" />
                Price Trajectory
              </h3>
              <div className="flex items-center gap-4 text-xs">
                <span className="flex items-center gap-1.5 text-gray-400">
                  <div className="w-2.5 h-2.5 rounded-full bg-oil-gold" />
                  Forecast
                </span>
              </div>
            </div>
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#F59E0B" stopOpacity={0.25} />
                      <stop offset="100%" stopColor="#F59E0B" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.04)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="date"
                    stroke="#444"
                    tick={{ fill: "#666", fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#444"
                    tick={{ fill: "#666", fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                    domain={[
                      minPrice - safePriceRange * 0.3,
                      maxPrice + safePriceRange * 0.3,
                    ]}
                    tickFormatter={(val) => formatCurrency(parseFiniteNumber(val), 2, "-")}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="price"
                    stroke="#F59E0B"
                    fillOpacity={1}
                    fill="url(#colorPrice)"
                    strokeWidth={2.5}
                    dot={{
                      r: 4,
                      fill: "#F59E0B",
                      strokeWidth: 2,
                      stroke: "#0e0c0a",
                    }}
                    activeDot={{
                      r: 6,
                      fill: "#F59E0B",
                      strokeWidth: 3,
                      stroke: "#0e0c0a",
                    }}
                  />
                  <ReferenceLine
                    y={data.last_price}
                    stroke="rgba(255,255,255,0.15)"
                    strokeDasharray="4 4"
                    label={{
                      value: `Current $${data.last_price.toFixed(2)}`,
                      fill: "#666",
                      fontSize: 11,
                    }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Price Range Bar */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
            className="glass p-6 rounded-2xl"
          >
            <div className="flex items-center justify-between text-sm mb-3">
              <span className="text-gray-500 font-medium">
                Forecast Price Range
              </span>
              <span className="text-gray-400 font-mono text-xs">
                ${minPrice.toFixed(2)} — ${maxPrice.toFixed(2)}
              </span>
            </div>
            <div className="relative h-2 bg-white/5 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-oil-amber via-oil-gold to-oil-light-gold rounded-full"
              />
              {/* Current price indicator */}
              <motion.div
                initial={{ left: "0%" }}
                animate={{
                  left: `${((data.last_price - minPrice) / (maxPrice - minPrice || 1)) * 100}%`,
                }}
                transition={{ duration: 1.5, delay: 0.5 }}
                className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white border-2 border-oil-gold shadow-lg"
              />
            </div>
          </motion.div>

          {/* Data Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="glass rounded-3xl overflow-hidden"
          >
            <div className="p-6 md:p-8 border-b border-white/5 flex items-center gap-3">
              <div className="w-1 h-6 rounded-full bg-gradient-to-b from-oil-blue to-oil-cyan" />
              <h3 className="text-lg font-bold text-white font-display">
                Detailed Forecasts
              </h3>
            </div>
            <div className="p-3 md:p-4">
              <Table
                columns={columns}
                dataSource={tableData}
                pagination={false}
                rowClassName="hover:bg-white/[0.03] transition-colors border-b border-white/5 last:border-0"
              />
            </div>
          </motion.div>
        </>
      )}

      {activeTab === "historical" && (
        <>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass p-4 md:p-5 rounded-2xl border border-white/10"
          >
            {/* Header row with download button */}
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-gray-500 font-semibold uppercase tracking-widest">
                Dataset Overview
              </span>
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={downloadHistoricalCSV}
                disabled={!historicalData?.data.length}
                className="flex items-center gap-2 px-4 py-2 rounded-xl glass border border-oil-cyan/30 text-oil-cyan text-xs font-semibold hover:border-oil-cyan/60 hover:bg-oil-cyan/5 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <Download size={14} />
                Download CSV
              </motion.button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="rounded-xl bg-white/[0.03] border border-white/10 p-4">
                <div className="flex items-center gap-2 text-gray-500 text-[11px] uppercase tracking-[0.2em] mb-2">
                  <Calendar size={13} className="text-oil-cyan" />
                  Dataset Window
                </div>
                <p className="text-base font-semibold text-white leading-tight">
                  {historicalStartDate}
                </p>
                <p className="text-xs text-gray-500 mt-1">to {historicalEndDate}</p>
              </div>

              <div className="rounded-xl bg-white/[0.03] border border-white/10 p-4">
                <div className="flex items-center gap-2 text-gray-500 text-[11px] uppercase tracking-[0.2em] mb-2">
                  <Activity size={13} className="text-emerald-400" />
                  Records Loaded
                </div>
                <p className="text-base font-semibold text-white leading-tight">
                  {historicalRecordsLoaded.toLocaleString("en-US")} / {" "}
                  {historicalRecordsAvailable.toLocaleString("en-US")}
                </p>
                <div className="mt-3 h-1.5 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-oil-cyan"
                    style={{ width: `${Math.min(historicalCoverage, 100)}%` }}
                  />
                </div>
              </div>

              <div className="rounded-xl bg-white/[0.03] border border-white/10 p-4">
                <div className="flex items-center gap-2 text-gray-500 text-[11px] uppercase tracking-[0.2em] mb-2">
                  <Radio size={13} className="text-oil-gold" />
                  Granularity
                </div>
                <p className="text-base font-semibold text-white capitalize leading-tight">
                  {historicalData?.granularity ?? "daily"}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Coverage: {historicalCoverage.toFixed(0)}%
                </p>
              </div>
            </div>
          </motion.div>

          {/* Inline progress bar while pages are still streaming in */}
          {historicalProgress < 100 && !historicalLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="rounded-2xl glass px-5 py-3 flex items-center gap-4"
            >
              <span className="text-xs text-gray-400 shrink-0">
                Loading data&hellip;
              </span>
              <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-oil-cyan to-oil-blue"
                  initial={{ width: "0%" }}
                  animate={{ width: `${historicalProgress}%` }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                />
              </div>
              <span className="text-xs font-mono text-oil-cyan shrink-0">
                {Math.round(historicalProgress)}%
              </span>
            </motion.div>
          )}

          {historicalLoading && (
            <div className="space-y-4">
              <Skeleton className="h-[360px] rounded-3xl" />
              <Skeleton className="h-[320px] rounded-3xl" />
            </div>
          )}

          {!historicalLoading && historicalError && (
            <div className="glass p-10 rounded-3xl text-center">
              <div className="w-14 h-14 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-5">
                <AlertTriangle size={28} className="text-red-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-3">Historical Data Error</h3>
              <p className="text-sm text-gray-400 mb-6">{historicalError}</p>
              <AnimatedButton
                variant="primary"
                onClick={fetchHistoricalPrices}
                className="px-6 py-2.5 rounded-xl text-sm"
              >
                Retry Historical Fetch
              </AnimatedButton>
            </div>
          )}

          {!historicalLoading && !historicalError && historicalChartData.length > 0 && (
            <>
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass p-6 md:p-8 rounded-3xl"
              >
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-lg font-bold text-white font-display flex items-center gap-3">
                    <div className="w-1 h-6 rounded-full bg-gradient-to-b from-oil-cyan to-oil-blue" />
                    Historical Price Trend
                  </h3>
                  <span className="text-xs text-gray-500">
                    OHLC close price series
                  </span>
                </div>
                <div className="h-[400px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={historicalChartData}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="rgba(255,255,255,0.04)"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="date"
                        stroke="#4b5563"
                        tick={{ fill: "#6b7280", fontSize: 11 }}
                        tickLine={false}
                        axisLine={false}
                        minTickGap={24}
                      />
                      <YAxis
                        stroke="#4b5563"
                        tick={{ fill: "#6b7280", fontSize: 11 }}
                        tickLine={false}
                        axisLine={false}
                        domain={[
                          historicalMinPrice - historicalPriceRange * 0.15,
                          historicalMaxPrice + historicalPriceRange * 0.15,
                        ]}
                        tickFormatter={(val) => `$${val.toFixed(0)}`}
                      />
                      <Tooltip
                        content={({ active, payload, label }) => {
                          if (!active || !payload?.length) return null;
                          const point = payload[0].payload;
                          return (
                            <div className="glass-strong p-4 rounded-xl shadow-2xl min-w-[180px]">
                              <p className="text-xs text-gray-400 mb-2">{label}</p>
                              <p className="text-lg font-bold text-oil-cyan mb-1">
                                ${point.price.toFixed(2)}
                              </p>
                              <p className="text-xs text-gray-500">
                                O: {point.open.toFixed(2)}  H: {point.high.toFixed(2)}
                              </p>
                              <p className="text-xs text-gray-500">
                                L: {point.low.toFixed(2)}
                              </p>
                            </div>
                          );
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="price"
                        stroke="#22D3EE"
                        strokeWidth={2.2}
                        dot={false}
                        activeDot={{
                          r: 5,
                          fill: "#22D3EE",
                          stroke: "#0f172a",
                          strokeWidth: 2,
                        }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass p-6 md:p-8 rounded-3xl"
              >
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-lg font-bold text-white font-display flex items-center gap-3">
                    <div className="w-1 h-6 rounded-full bg-gradient-to-b from-emerald-400 to-red-400" />
                    Daily Change (%)
                  </h3>
                  <span className="text-xs text-gray-500">
                    Positive vs negative daily moves
                  </span>
                </div>
                <div className="h-[340px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={historicalChartData}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="rgba(255,255,255,0.04)"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="date"
                        stroke="#4b5563"
                        tick={{ fill: "#6b7280", fontSize: 11 }}
                        tickLine={false}
                        axisLine={false}
                        minTickGap={24}
                      />
                      <YAxis
                        stroke="#4b5563"
                        tick={{ fill: "#6b7280", fontSize: 11 }}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(val) => `${val}%`}
                      />
                      <Tooltip
                        content={({ active, payload, label }) => {
                          if (!active || !payload?.length) return null;
                          const value = payload[0].value as number;
                          return (
                            <div className="glass-strong p-4 rounded-xl shadow-2xl min-w-[180px]">
                              <p className="text-xs text-gray-400 mb-2">{label}</p>
                              <p className="text-lg font-bold text-oil-gold mb-1">
                                Change : {Number(value ?? 0).toFixed(2)}%
                              </p>
                            </div>
                          );
                        }}
                      />
                      <Bar
                        dataKey="changePct"
                        radius={[4, 4, 0, 0]}
                        fill="#f59e0b"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>
            </>
          )}
        </>
      )}

      {activeTab === "analytics" && (
        <>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass p-6 md:p-8 rounded-3xl"
          >
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
              <div>
                <div className="text-xs text-emerald-300/80 font-semibold uppercase tracking-[0.24em] mb-2">
                  Prediction Accuracy
                </div>
                <h3 className="text-xl font-bold text-white font-display">
                  Predicted vs Actual Price Analytics
                </h3>
                <p className="text-sm text-gray-500 mt-2 max-w-3xl leading-relaxed">
                  Compare realized Brent prices against the model&apos;s aggregated predictions for a custom date range.
                </p>
              </div>

              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  fetchPredictionComparison(analyticsStartDate, analyticsEndDate);
                }}
                className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full lg:w-auto"
              >
                <label className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-widest text-gray-500">
                  <span>Start Date</span>
                  <input
                    type="date"
                    value={analyticsStartDate}
                    max={analyticsEndDate}
                    onChange={(event) => setAnalyticsStartDate(event.target.value)}
                    className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm text-white outline-none focus:border-emerald-400/60"
                  />
                </label>
                <label className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-widest text-gray-500">
                  <span>End Date</span>
                  <input
                    type="date"
                    value={analyticsEndDate}
                    min={analyticsStartDate}
                    onChange={(event) => setAnalyticsEndDate(event.target.value)}
                    className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm text-white outline-none focus:border-emerald-400/60"
                  />
                </label>
                <button
                  type="submit"
                  disabled={analyticsLoading}
                  className="h-fit self-end px-5 py-3 rounded-xl bg-emerald-400/15 border border-emerald-400/30 text-sm font-semibold text-emerald-300 hover:border-emerald-300/60 hover:bg-emerald-400/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {analyticsLoading ? "Loading..." : "Update Analytics"}
                </button>
              </form>
            </div>

            {analyticsData && (
              <div className="mt-6 flex flex-col gap-2 text-xs text-gray-500">
                <span>
                  Window: {dateUtils.formatRange(analyticsStartDate, analyticsEndDate)}
                </span>
                <span>{analyticsData.aggregation_strategy}</span>
              </div>
            )}
          </motion.div>

          {analyticsLoading && !analyticsData && (
            <div className="space-y-4">
              <Skeleton className="h-36 rounded-3xl" />
              <Skeleton className="h-[420px] rounded-3xl" />
            </div>
          )}

          {!analyticsLoading && analyticsError && (
            <div className="glass p-10 rounded-3xl text-center">
              <div className="w-14 h-14 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-5">
                <AlertTriangle size={28} className="text-red-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-3">Analytics Error</h3>
              <p className="text-sm text-gray-400 mb-6">{analyticsError}</p>
              <AnimatedButton
                variant="primary"
                onClick={() =>
                  fetchPredictionComparison(analyticsStartDate, analyticsEndDate)
                }
                className="px-6 py-2.5 rounded-xl text-sm"
              >
                Retry Analytics Fetch
              </AnimatedButton>
            </div>
          )}

          {!analyticsLoading && !analyticsError && analyticsData && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass p-6 rounded-2xl"
                >
                  <div className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-3">
                    Compared Days
                  </div>
                  <div className="text-3xl font-bold text-white font-display">
                    {analyticsMetrics?.compared_days ?? analyticsData.total_days_returned}
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    Dates with both actual and predicted values
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 }}
                  className="glass p-6 rounded-2xl"
                >
                  <div className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-3">
                    MAE
                  </div>
                  <div className="text-3xl font-bold text-oil-gold font-display">
                    {formatCurrency(analyticsMetrics?.mae)}
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    Mean absolute error across the selected window
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="glass p-6 rounded-2xl"
                >
                  <div className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-3">
                    RMSE
                  </div>
                  <div className="text-3xl font-bold text-emerald-300 font-display">
                    {formatCurrency(analyticsMetrics?.rmse)}
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    Penalizes larger misses more heavily
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="glass p-6 rounded-2xl"
                >
                  <div className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-3">
                    MAPE
                  </div>
                  <div className="text-3xl font-bold text-oil-cyan font-display">
                    {formatFixed(analyticsMetrics?.mape)}%
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    Average percentage deviation from actual prices
                  </div>
                </motion.div>
              </div>

              {analyticsChartData.length > 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="glass p-6 md:p-8 rounded-3xl"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                    <div>
                      <h3 className="text-lg font-bold text-white font-display flex items-center gap-3">
                        <div className="w-1 h-6 rounded-full bg-gradient-to-b from-emerald-300 to-oil-cyan" />
                        Actual vs Predicted Prices
                      </h3>
                      <p className="text-xs text-gray-500 mt-2">
                        Weighted mean prediction compared with realized closing prices
                      </p>
                    </div>
                    <div className="flex items-center gap-4 text-xs">
                      <span className="flex items-center gap-1.5 text-gray-400">
                        <div className="w-6 h-0.5 bg-oil-cyan" />
                        Actual
                      </span>
                      <span className="flex items-center gap-1.5 text-gray-400">
                        <div className="w-6 h-0.5 bg-oil-gold" />
                        Predicted
                      </span>
                    </div>
                  </div>

                  <div className="h-[420px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={analyticsChartData}>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="rgba(255,255,255,0.04)"
                          vertical={false}
                        />
                        <XAxis
                          dataKey="date"
                          stroke="#4b5563"
                          tick={{ fill: "#6b7280", fontSize: 11 }}
                          tickLine={false}
                          axisLine={false}
                          minTickGap={24}
                        />
                        <YAxis
                          stroke="#4b5563"
                          tick={{ fill: "#6b7280", fontSize: 11 }}
                          tickLine={false}
                          axisLine={false}
                          domain={[
                            analyticsMinPrice - analyticsPriceRange * 0.15,
                            analyticsMaxPrice + analyticsPriceRange * 0.15,
                          ]}
                          tickFormatter={(value) =>
                            formatCurrency(parseFiniteNumber(value), 0, "0")
                          }
                        />
                        <Tooltip content={<AnalyticsTooltip />} />
                        <Line
                          type="monotone"
                          dataKey="actualPrice"
                          stroke="#22D3EE"
                          strokeWidth={2.4}
                          dot={false}
                          activeDot={{
                            r: 5,
                            fill: "#22D3EE",
                            stroke: "#0f172a",
                            strokeWidth: 2,
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="predictedPrice"
                          stroke="#F59E0B"
                          strokeWidth={2.4}
                          dot={false}
                          activeDot={{
                            r: 5,
                            fill: "#F59E0B",
                            stroke: "#0f172a",
                            strokeWidth: 2,
                          }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </motion.div>
              ) : (
                <div className="glass p-10 rounded-3xl text-center text-sm text-gray-400">
                  No prediction comparison data was returned for the selected dates.
                </div>
              )}

              {fanData && fanData.fan.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="glass p-6 md:p-8 rounded-3xl"
                >
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-lg font-bold text-white font-display flex items-center gap-3">
                      <div className="w-1 h-6 rounded-full bg-gradient-to-b from-oil-cyan to-oil-blue" />
                      Probabilistic Fan Chart
                    </h3>
                    <span className="text-xs text-gray-500">
                      Uncertainty bands: P10 – P90
                    </span>
                  </div>
                  <FanChart
                    fan={fanData.fan}
                    lastPrice={fanData.last_price}
                    lastPriceDate={fanData.last_price_date}
                  />
                </motion.div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}

export default Dashboard;
