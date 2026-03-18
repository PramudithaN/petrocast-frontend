import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Download,
  Upload,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Activity,
  AlertCircle,
  CalendarDays,
  FileSpreadsheet,
  CircleCheck,
  Info,
} from "lucide-react";
import { PredictionResponse } from "../types/api";
import { downloadExcelTemplate, uploadExcelFile } from "../api";
import { useNotification } from "../context/NotificationContext";
import { useDateUtils } from "../utils/dateUtils";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);

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

function UploadData() {
  const [predictions, setPredictions] = useState<PredictionResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [downloadingTemplate, setDownloadingTemplate] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState<string>("");
  const [showUploader, setShowUploader] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { notify } = useNotification();
  const dateUtils = useDateUtils();

  const handleDownloadTemplate = async () => {
    try {
      setDownloadingTemplate(true);
      setError(null);
      await downloadExcelTemplate();
      notify({
        type: "success",
        title: "Template downloaded",
        message: "Excel template is ready for data entry",
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to download template";
      setError(msg);
      notify({
        type: "error",
        title: "Download failed",
        message: msg,
      });
    } finally {
      setDownloadingTemplate(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    // Validate file type
    if (
      !file.name.endsWith(".xlsx") &&
      !file.name.endsWith(".xls") &&
      !file.type.includes("spreadsheet")
    ) {
      const msg = "Please upload an Excel file (.xlsx or .xls)";
      setError(msg);
      notify({
        type: "error",
        title: "Invalid file type",
        message: msg,
      });
      return;
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      const msg = "File size must be less than 10MB";
      setError(msg);
      notify({
        type: "error",
        title: "File too large",
        message: msg,
      });
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const result = await uploadExcelFile(file);
      setPredictions(result);
      setShowUploader(false);
      notify({
        type: "success",
        title: "Predictions generated",
        message: `${result.forecasts.length} trading day${result.forecasts.length === 1 ? "" : "s"} of predictions ready`,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to upload file";
      setError(msg);
      notify({
        type: "error",
        title: "Upload failed",
        message: msg,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFileName(e.dataTransfer.files[0].name);
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFileName(e.target.files[0].name);
      handleFileUpload(e.target.files[0]);
      e.target.value = "";
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  // Chart data preparation
  const chartData = (predictions?.forecasts ?? []).map((item) => ({
    date: dateUtils.format(item.date, "short"),
    price: item.forecasted_price,
    horizon: item.horizon,
    rawDate: item.date,
  }));

  const priceValues = chartData.map((d) => d.price);
  const minPrice = priceValues.length ? Math.min(...priceValues) : 0;
  const maxPrice = priceValues.length ? Math.max(...priceValues) : 0;
  const avgPrice = priceValues.length
    ? priceValues.reduce((a, b) => a + b, 0) / priceValues.length
    : 0;

  const firstForecast = predictions?.forecasts?.[0];
  const lastForecast = predictions?.forecasts?.[predictions.forecasts.length - 1];
  const priceChange =
    firstForecast && lastForecast
      ? lastForecast.forecasted_price - firstForecast.forecasted_price
      : 0;
  const priceChangePercent =
    firstForecast && firstForecast.forecasted_price
      ? (priceChange / firstForecast.forecasted_price) * 100
      : 0;
  const isPositive = priceChange >= 0;

  return (
    <div className="px-4 sm:px-6 md:px-8 lg:px-10 pt-24 pb-8 space-y-8 max-w-[1700px] mx-auto min-h-screen bg-oil-black">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-start justify-between gap-6 pb-6 border-b border-white/5"
      >
        <div>
          <div className="flex items-center gap-2 text-oil-gold/80 text-xs mb-2 font-semibold tracking-widest uppercase">
            <motion.div
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Upload size={14} />
            </motion.div>
            <span>Custom Data Upload</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight font-display">
            Upload & Predict
          </h1>
          <p className="text-gray-500 mt-2 text-sm">
            Upload your 30-day historical oil price data and get AI-powered forecasts
          </p>
        </div>

        <div className="w-full md:w-auto md:pt-1 flex items-center gap-3 justify-end">
          {predictions ? (
            <button
              type="button"
              onClick={() => setShowUploader(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-white/15 text-sm font-semibold text-gray-200 hover:text-white hover:border-white/30 transition-all"
            >
              <Upload size={14} />
              Reupload
            </button>
          ) : null}

          <button
            type="button"
            onClick={handleDownloadTemplate}
            disabled={downloadingTemplate}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-oil-gold/35 text-oil-gold text-sm font-semibold bg-oil-gold/5 hover:bg-oil-gold/12 hover:border-oil-gold/55 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <Download size={14} />
            {downloadingTemplate ? "Downloading..." : "Download Template"}
          </button>
        </div>
      </motion.div>

      {/* Instruction Banner */}
      <motion.section
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
        className="relative overflow-hidden rounded-2xl border border-oil-gold/20 bg-gradient-to-r from-oil-gold/10 via-white/[0.02] to-transparent p-4 md:p-5"
      >
        <div className="absolute inset-y-0 right-0 w-40 bg-oil-gold/10 blur-3xl opacity-50 pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-start gap-3 md:items-center md:gap-2 mb-4">
            <Info size={16} className="text-oil-gold mt-0.5 md:mt-0" />
            <h2 className="text-sm md:text-base font-semibold text-white tracking-wide">
              Before You Upload
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="rounded-xl border border-white/10 bg-black/20 p-3">
              <div className="flex items-center gap-2 text-oil-gold mb-1.5">
                <CalendarDays size={14} />
                <span className="text-xs uppercase tracking-wider font-semibold">Data Window</span>
              </div>
              <p className="text-xs md:text-sm text-gray-300">Provide exactly 30 days of historical data.</p>
            </div>

            <div className="rounded-xl border border-white/10 bg-black/20 p-3">
              <div className="flex items-center gap-2 text-oil-gold mb-1.5">
                <FileSpreadsheet size={14} />
                <span className="text-xs uppercase tracking-wider font-semibold">Template</span>
              </div>
              <p className="text-xs md:text-sm text-gray-300">Download and use the provided Excel template structure.</p>
            </div>

            <div className="rounded-xl border border-white/10 bg-black/20 p-3">
              <div className="flex items-center gap-2 text-oil-gold mb-1.5">
                <Upload size={14} />
                <span className="text-xs uppercase tracking-wider font-semibold">Upload</span>
              </div>
              <p className="text-xs md:text-sm text-gray-300">Upload only .xlsx or .xls files (maximum 10MB).</p>
            </div>

            <div className="rounded-xl border border-white/10 bg-black/20 p-3">
              <div className="flex items-center gap-2 text-oil-gold mb-1.5">
                <CircleCheck size={14} />
                <span className="text-xs uppercase tracking-wider font-semibold">Result</span>
              </div>
              <p className="text-xs md:text-sm text-gray-300">Forecasts are generated instantly after successful upload.</p>
            </div>
          </div>
        </div>
      </motion.section>

      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        onChange={handleInputChange}
        disabled={loading}
        className="hidden"
      />

      {showUploader ? (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={handleUploadClick}
          className={`relative overflow-hidden min-h-[calc(100vh-190px)] rounded-[2rem] border-2 border-dashed transition-all duration-300 cursor-pointer ${
            dragActive
              ? "border-oil-gold/70 shadow-[0_0_50px_rgba(245,158,11,0.25)]"
              : "border-white/10 hover:border-oil-gold/40"
          }`}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_25%,rgba(245,158,11,0.18),rgba(14,12,10,0.9)_45%),linear-gradient(120deg,rgba(255,255,255,0.03),rgba(255,255,255,0.0)_35%)]" />
          <motion.div
            animate={{
              opacity: dragActive ? 0.7 : 0.4,
              scale: dragActive ? 1.06 : 1,
            }}
            transition={{ duration: 0.35 }}
            className="absolute -top-32 -right-24 h-80 w-80 rounded-full bg-oil-gold/20 blur-3xl"
          />

          <div className="relative z-10 min-h-[calc(100vh-190px)] grid place-items-center px-6 py-12">
            <div className="w-full max-w-2xl flex flex-col items-center text-center">
              <motion.div
                animate={{
                  y: dragActive ? 0 : [0, -8, 0],
                  scale: dragActive ? 1.12 : 1,
                  rotate: dragActive ? 2 : 0,
                }}
                transition={{ duration: 1.8, repeat: dragActive ? 0 : Infinity }}
                className="mb-6"
              >
                <div className="relative p-4 rounded-3xl bg-gradient-to-br from-oil-gold/30 to-oil-amber/10 border border-oil-gold/30 shadow-xl shadow-oil-gold/20">
                  <Upload size={42} className="text-oil-gold" strokeWidth={1.5} />
                </div>
              </motion.div>

              <h2 className="text-xl md:text-2xl font-display font-bold text-white tracking-tight text-center">
                {dragActive ? "Drop File To Upload" : "Drag And Drop Excel File"}
              </h2>

              <p className="mt-3 max-w-xl text-sm md:text-base text-gray-300 leading-relaxed text-center">
                Fill the template with 30-day data, then drop it here to generate forecasts.
              </p>

              <div className="mt-8 flex flex-col items-center gap-3 text-center">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleUploadClick();
                  }}
                  disabled={loading}
                  className="relative overflow-hidden rounded-xl px-7 py-3 text-sm md:text-base font-bold text-oil-black bg-gradient-to-r from-oil-gold to-oil-amber shadow-lg shadow-oil-gold/30 transition-all duration-300 hover:shadow-xl hover:shadow-oil-gold/40 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <span className="relative inline-flex items-center gap-2">
                    <Upload size={18} />
                    {loading ? "Uploading..." : "Choose Excel File"}
                  </span>
                </button>

                <p className="text-xs md:text-sm text-gray-400">
                  Supports .xlsx and .xls files. Max size 10MB.
                </p>

                {selectedFileName ? (
                  <p className="text-xs md:text-sm text-oil-gold/90 font-medium text-center">
                    Selected file: {selectedFileName}
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        </motion.section>
      ) : null}

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/30"
          >
            <AlertCircle size={20} className="text-red-400 flex-shrink-0" />
            <div>
              <p className="text-red-300 font-medium">Error</p>
              <p className="text-red-200/70 text-sm">{error}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results */}
      <AnimatePresence>
        {predictions && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Last Price */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="glass p-6 rounded-2xl group hover:border-oil-gold/20 transition-all duration-500"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider">
                    Last Known Price
                  </span>
                  <div className="p-2 rounded-xl bg-oil-gold/10">
                    <DollarSign size={16} className="text-oil-gold" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-white font-display">
                  {formatCurrency(predictions.last_price)}
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  {dateUtils.format(predictions.last_price_date, "short")}
                </div>
              </motion.div>

              {/* Average Forecast */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="glass p-6 rounded-2xl group hover:border-oil-gold/20 transition-all duration-500"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider">
                    Average Forecast
                  </span>
                  <div className="p-2 rounded-xl bg-blue-500/10">
                    <DollarSign size={16} className="text-blue-400" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-white font-display">
                  {formatCurrency(avgPrice)}
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  Next {predictions.forecasts.length} days
                </div>
              </motion.div>

              {/* Min Price */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="glass p-6 rounded-2xl group hover:border-oil-gold/20 transition-all duration-500"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider">
                    Min Forecast
                  </span>
                  <div className="p-2 rounded-xl bg-red-500/10">
                    <TrendingDown size={16} className="text-red-400" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-white font-display">
                  {formatCurrency(minPrice)}
                </div>
                <div className="mt-2 text-xs text-gray-500">Lowest predicted price</div>
              </motion.div>

              {/* Max Price */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="glass p-6 rounded-2xl group hover:border-oil-gold/20 transition-all duration-500"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider">
                    Max Forecast
                  </span>
                  <div className="p-2 rounded-xl bg-emerald-500/10">
                    <TrendingUp size={16} className="text-emerald-400" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-white font-display">
                  {formatCurrency(maxPrice)}
                </div>
                <div className="mt-2 text-xs text-gray-500">Highest predicted price</div>
              </motion.div>
            </div>

            {/* Forecast Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="glass p-8 rounded-2xl"
            >
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Activity size={20} className="text-oil-gold" />
                Forecast Chart
              </h2>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient
                      id="forecastGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis
                    dataKey="date"
                    stroke="rgba(255,255,255,0.2)"
                    style={{ fontSize: "12px" }}
                  />
                  <YAxis
                    stroke="rgba(255,255,255,0.2)"
                    style={{ fontSize: "12px" }}
                    domain={[minPrice * 0.95, maxPrice * 1.05]}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(30, 30, 30, 0.9)",
                      border: "1px solid rgba(245, 158, 11, 0.3)",
                      borderRadius: "8px",
                      color: "#fff",
                    }}
                    formatter={(value) => formatCurrency(value as number | null)}
                  />
                  <Area
                    type="monotone"
                    dataKey="price"
                    stroke="#F59E0B"
                    strokeWidth={2}
                    fill="url(#forecastGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Forecasts Table */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="glass p-8 rounded-2xl"
            >
              <h2 className="text-xl font-bold text-white mb-6">Detailed Forecasts</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-3 px-4 text-gray-400 font-semibold">
                        Date
                      </th>
                      <th className="text-right py-3 px-4 text-gray-400 font-semibold">
                        Forecasted Price
                      </th>
                      <th className="text-right py-3 px-4 text-gray-400 font-semibold">
                        Horizon
                      </th>
                      <th className="text-right py-3 px-4 text-gray-400 font-semibold">
                        Return
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {predictions.forecasts.map((forecast) => (
                      <tr
                        key={forecast.date}
                        className="border-b border-white/5 hover:bg-white/5 transition-colors"
                      >
                        <td className="py-3 px-4 text-gray-300">
                          {dateUtils.format(forecast.date, "medium")}
                        </td>
                        <td className="py-3 px-4 text-right text-white font-medium">
                          {formatCurrency(forecast.forecasted_price)}
                        </td>
                        <td className="py-3 px-4 text-right text-gray-400">
                          Day {forecast.horizon}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span
                            className={`text-sm font-medium ${
                              forecast.forecasted_return >= 0
                                ? "text-emerald-400"
                                : "text-red-400"
                            }`}
                          >
                            {forecast.forecasted_return >= 0 ? "+" : ""}
                            {forecast.forecasted_return.toFixed(2)}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>

            {/* Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="glass p-6 rounded-2xl flex items-start gap-4"
            >
              <div className={`p-3 rounded-xl flex-shrink-0 ${
                isPositive ? "bg-emerald-500/10" : "bg-red-500/10"
              }`}>
                {isPositive ? (
                  <TrendingUp size={24} className="text-emerald-400" />
                ) : (
                  <TrendingDown size={24} className="text-red-400" />
                )}
              </div>
              <div>
                <h3 className="text-lg font-bold text-white mb-1">
                  Forecast Summary
                </h3>
                <p className="text-gray-400">
                  Based on your uploaded data, oil prices are forecasted to{" "}
                  <span
                    className={`font-bold ${
                      isPositive ? "text-emerald-400" : "text-red-400"
                    }`}
                  >
                    {isPositive ? "increase" : "decrease"}
                  </span>{" "}
                  by{" "}
                  <span
                    className={`font-bold ${
                      isPositive ? "text-emerald-400" : "text-red-400"
                    }`}
                  >
                    {Math.abs(priceChange).toFixed(2)} USD ({Math.abs(priceChangePercent).toFixed(2)}%)
                  </span>{" "}
                  over the forecasting period.
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default UploadData;
