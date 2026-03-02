import { useState, useEffect } from "react";
import { Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { PredictionResponse } from "../types/api";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
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
  Clock,
  AlertTriangle,
} from "lucide-react";
import CountUp from "react-countup";

const API_URL = "https://pramudithan-oil-price-prediction.hf.space/predict";

/* ─── Skeleton Loader ─── */
const Skeleton = ({ className = "" }: { className?: string }) => (
  <div className={`animate-pulse rounded-xl bg-white/5 ${className}`} />
);

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
      {[1, 2, 3, 4].map((i) => (
        <Skeleton key={i} className="h-36 rounded-2xl" />
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
  return (
    <div className="glass-strong p-4 rounded-xl shadow-2xl min-w-[160px]">
      <p className="text-xs text-gray-400 mb-2">{label}</p>
      <p className="text-xl font-bold text-oil-gold font-display">
        $
        {typeof payload[0].value === "number"
          ? payload[0].value.toFixed(2)
          : payload[0].value}
      </p>
      <p className="text-xs text-gray-500 mt-1">
        {payload[0]?.payload?.type === "Historical" ? "● Actual" : "◐ Forecast"}
      </p>
    </div>
  );
};

function Dashboard() {
  const [data, setData] = useState<PredictionResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchPredictions();
  }, []);

  const fetchPredictions = async () => {
    try {
      setLoading(true);
      setError(null);
      setRefreshing(true);
      const response = await fetch(API_URL);
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      const result: PredictionResponse = await response.json();
      setData(result);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch predictions",
      );
    } finally {
      setLoading(false);
      setTimeout(() => setRefreshing(false), 500);
    }
  };

  const formatPrice = (price: number): string => price.toFixed(2);

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

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
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={fetchPredictions}
            className="px-6 py-3 bg-gradient-to-r from-oil-gold to-oil-amber text-oil-black font-bold rounded-xl text-sm"
          >
            Retry Connection
          </motion.button>
        </motion.div>
      </div>
    );
  }

  if (!data) return null;

  const priceChange =
    data.forecasts.length > 0
      ? data.forecasts[0].forecasted_price - data.last_price
      : 0;
  const priceChangePercent =
    data.last_price > 0 ? (priceChange / data.last_price) * 100 : 0;
  const isPositive = priceChange >= 0;

  // Chart data
  const chartData = [
    {
      date: new Date(data.last_price_date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      price: data.last_price,
      type: "Historical",
    },
    ...data.forecasts.map((f) => ({
      date: new Date(f.date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      price: f.forecasted_price,
      type: "Forecast",
    })),
  ];

  const tableData = data.forecasts.map((forecast, index) => ({
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
          {formatDate(date)}
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
              {formatDate(data.last_price_date)}
            </span>
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={fetchPredictions}
          disabled={refreshing}
          className="group flex items-center gap-3 px-6 py-3 glass hover:border-oil-gold/30 rounded-xl text-white font-medium transition-all duration-300 disabled:opacity-50"
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
              <CountUp end={data.forecasts.length} duration={1} preserveValue />
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
              Actual
            </span>
            <span className="flex items-center gap-1.5 text-gray-400">
              <div className="w-2.5 h-2.5 rounded-full bg-oil-gold/40 border border-oil-gold/60" />
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
                  minPrice - priceRange * 0.3,
                  maxPrice + priceRange * 0.3,
                ]}
                tickFormatter={(val) => `$${val}`}
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
    </div>
  );
}

export default Dashboard;
