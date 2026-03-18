import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Pagination } from "antd";
import { motion } from "framer-motion";
import {
  Calendar,
  ExternalLink,
  Newspaper,
  RefreshCw,
  Search,
} from "lucide-react";
import { fetchNews } from "../api";
import { NewsArticle } from "../types/api";
import AnimatedButton from "./ui/AnimatedButton";
import { useNotification } from "../context/NotificationContext";

// Preload an image URL by creating an in-memory Image object
const preloadImage = (src: string) => {
  const img = new Image();
  img.src = src;
};

// Per-image component that shows a skeleton while loading and fades in on load
const NewsImage = ({
  src,
  alt,
  articleId,
  onError,
}: {
  src: string;
  alt: string;
  articleId: string | number;
  onError: (id: string | number) => void;
}) => {
  const [loaded, setLoaded] = useState(false);

  return (
    <>
      {!loaded && (
        <div className="absolute inset-0 bg-oil-dark/80 animate-pulse" />
      )}
      <img
        src={src}
        alt={alt}
        className={`h-full w-full object-cover transition-opacity duration-500 ${loaded ? "opacity-100" : "opacity-0"}`}
        loading="lazy"
        decoding="async"
        referrerPolicy="no-referrer"
        onLoad={() => setLoaded(true)}
        onError={() => onError(articleId)}
      />
    </>
  );
};

type Mode = "recent" | "date";
const ARTICLES_PER_PAGE = 6;

const formatArticleDate = (dateString: string) => {
  if (!dateString || dateString === "Unknown") return "Unknown date";

  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
};

const News = () => {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});
  const [mode, setMode] = useState<Mode>("recent");
  const [daysInput, setDaysInput] = useState("7");
  const [dateInput, setDateInput] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const { notify } = useNotification();
  const initialFetchDone = useRef(false);

  const distinctDates = useMemo(
    () =>
      new Set(articles.map((article) => article.article_date).filter(Boolean)).size,
    [articles],
  );

  const pagedArticles = useMemo(() => {
    const start = (currentPage - 1) * ARTICLES_PER_PAGE;
    const end = start + ARTICLES_PER_PAGE;
    return articles.slice(start, end);
  }, [articles, currentPage]);

  // Preload next page images in the background for instant display when user navigates
  useEffect(() => {
    const nextStart = currentPage * ARTICLES_PER_PAGE;
    const nextPageArticles = articles.slice(nextStart, nextStart + ARTICLES_PER_PAGE);
    nextPageArticles.forEach((article) => {
      if (article.image_url && !failedImages[article.id]) {
        preloadImage(article.image_url);
      }
    });
  }, [currentPage, articles, failedImages]);

  const handleImageError = useCallback((id: string | number) => {
    setFailedImages((current) => ({ ...current, [id]: true }));
  }, []);

  const loadNews = async (options?: { days?: number; articleDate?: string }) => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchNews(options);
      setArticles(result.articles);
      setFailedImages({});
      setCurrentPage(1);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to fetch news articles";
      setError(message);
      notify({ type: "error", title: "News fetch failed", message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialFetchDone.current) return;
    initialFetchDone.current = true;
    loadNews();
  }, []);

  const handleFilterSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (mode === "date") {
      if (!dateInput) {
        setError("Pick a date first to filter articles.");
        notify({
          type: "warning",
          title: "Date required",
          message: "Pick a date first to filter articles.",
        });
        return;
      }
      loadNews({ articleDate: dateInput });
      return;
    }

    const parsedDays = Number(daysInput);
    if (!Number.isInteger(parsedDays) || parsedDays <= 0) {
      setError("Days must be a positive whole number.");
      notify({
        type: "warning",
        title: "Invalid days value",
        message: "Days must be a positive whole number.",
      });
      return;
    }

    loadNews({ days: parsedDays });
  };

  const handleReset = () => {
    setMode("recent");
    setDaysInput("7");
    setDateInput("");
    setCurrentPage(1);
    loadNews();
  };

  return (
    <div className="relative min-h-screen bg-oil-black pt-24 pb-16 px-4 sm:px-6 md:px-8">
      <div className="pointer-events-none absolute inset-0 bg-grid-pattern opacity-80" />
      <div className="pointer-events-none absolute -top-20 left-1/2 -translate-x-1/2 w-[560px] h-[560px] rounded-full bg-oil-gold/10 blur-[150px]" />

      <div className="relative max-w-6xl mx-auto space-y-7">
        <header className="glass-strong rounded-3xl p-6 md:p-8 border border-oil-gold/15">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-oil-light-gold/80 mb-2">
                Live Market Intelligence
              </p>
              <h1 className="text-3xl md:text-4xl font-display font-bold text-gradient-white">
                Energy News Feed
              </h1>
              <p className="text-sm text-gray-400 mt-3 max-w-2xl">
                Monitor the latest macro, policy, and commodity headlines that can
                shift Brent crude expectations.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs text-gray-400">
              <div className="glass rounded-xl px-4 py-3">
                <p className="uppercase tracking-wide text-gray-500">Articles</p>
                <p className="text-xl text-white font-semibold mt-1">{articles.length}</p>
              </div>
              <div className="glass rounded-xl px-4 py-3">
                <p className="uppercase tracking-wide text-gray-500">Distinct Dates</p>
                <p className="text-xl text-white font-semibold mt-1">{distinctDates}</p>
              </div>
            </div>
          </div>
        </header>

        <form
          onSubmit={handleFilterSubmit}
          className="glass-strong rounded-2xl p-5 border border-white/10"
        >
          <div className="flex flex-col xl:flex-row gap-4 xl:items-end xl:justify-between">
            <div className="flex items-center gap-4 flex-wrap">
              <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                <input
                  type="radio"
                  name="news-mode"
                  value="recent"
                  checked={mode === "recent"}
                  onChange={() => setMode("recent")}
                  className="accent-oil-gold"
                />
                Most recent distinct dates
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                <input
                  type="radio"
                  name="news-mode"
                  value="date"
                  checked={mode === "date"}
                  onChange={() => setMode("date")}
                  className="accent-oil-gold"
                />
                Exact date
              </label>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto">
              {mode === "recent" ? (
                <div className="flex flex-col gap-1">
                  <label htmlFor="days" className="text-xs text-gray-400">
                    Distinct dates count
                  </label>
                  <input
                    id="days"
                    type="number"
                    min={1}
                    value={daysInput}
                    onChange={(event) => setDaysInput(event.target.value)}
                    className="h-11 rounded-xl bg-oil-dark/70 border border-white/10 px-4 text-sm text-white focus:outline-none focus:border-oil-gold/60"
                  />
                </div>
              ) : (
                <div className="flex flex-col gap-1">
                  <label htmlFor="article-date" className="text-xs text-gray-400">
                    Article date
                  </label>
                  <input
                    id="article-date"
                    type="date"
                    value={dateInput}
                    onChange={(event) => setDateInput(event.target.value)}
                    className="h-11 rounded-xl bg-oil-dark/70 border border-white/10 px-4 text-sm text-white focus:outline-none focus:border-oil-gold/60"
                  />
                </div>
              )}

              <div className="flex items-end gap-2">
                <AnimatedButton type="submit" variant="primary" className="h-11 px-5">
                  <Search size={16} />
                  Apply
                </AnimatedButton>
                <AnimatedButton
                  type="button"
                  variant="secondary"
                  onClick={handleReset}
                  className="h-11 px-4"
                >
                  <RefreshCw size={16} />
                  Reset
                </AnimatedButton>
              </div>
            </div>
          </div>
        </form>

        {error && (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}

        {loading ? (
          <div className="grid md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((key) => (
              <div key={key} className="h-48 rounded-2xl bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : articles.length === 0 ? (
          <div className="glass-strong rounded-2xl p-10 border border-white/10 text-center">
            <Newspaper className="mx-auto text-gray-500" size={36} />
            <p className="mt-3 text-white font-semibold">No articles found</p>
            <p className="text-sm text-gray-400 mt-1">
              Try a different date filter or reset to the default latest feed.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              {pagedArticles.map((article, index) => (
                <motion.article
                  key={`${article.id}-${(currentPage - 1) * ARTICLES_PER_PAGE + index}`}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04 }}
                  className="glass-strong rounded-2xl p-4 border border-white/10 flex flex-col gap-4"
                >
                  <div className="relative overflow-hidden rounded-xl h-44 bg-oil-dark/80 border border-white/10">
                    {article.image_url && !failedImages[article.id] ? (
                      <NewsImage
                        src={article.image_url}
                        alt={article.title}
                        articleId={article.id}
                        onError={handleImageError}
                      />
                    ) : (
                      <div className="h-full w-full bg-gradient-to-br from-oil-gold/20 via-oil-gold/5 to-oil-dark flex items-center justify-center">
                        <Newspaper className="text-oil-light-gold/70" size={34} />
                      </div>
                    )}
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/55 to-transparent" />
                  </div>

                  <div className="flex items-center justify-between gap-3 text-xs text-gray-400">
                    <span className="inline-flex items-center gap-1.5">
                      <Calendar size={14} />
                      {formatArticleDate(article.article_date)}
                    </span>
                    <span className="uppercase tracking-wide text-oil-light-gold/80">
                      {article.source ?? "Unknown source"}
                    </span>
                  </div>

                  <h2 className="text-lg font-semibold text-white leading-snug">
                    {article.title}
                  </h2>

                  <p className="text-sm text-gray-400 leading-relaxed line-clamp-4 flex-1">
                    {article.summary ?? "No summary available for this article."}
                  </p>

                  {article.url && (
                    <a
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm text-oil-gold hover:text-oil-light-gold transition-colors"
                    >
                      Read source
                      <ExternalLink size={15} />
                    </a>
                  )}
                </motion.article>
              ))}
            </div>

            {articles.length > ARTICLES_PER_PAGE && (
              <div className="flex justify-center">
                <Pagination
                  current={currentPage}
                  pageSize={ARTICLES_PER_PAGE}
                  total={articles.length}
                  onChange={(page) => setCurrentPage(page)}
                  showSizeChanger={false}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default News;
