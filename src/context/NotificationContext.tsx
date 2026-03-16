import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  X,
} from "lucide-react";

/* ─── Types ──────────────────────────────────────────── */
export type NotificationType = "success" | "error" | "warning" | "info";

export interface NotificationOptions {
  type: NotificationType;
  title: string;
  message?: string;
  /** Auto-dismiss delay in ms. Default 4000. Pass 0 to disable. */
  duration?: number;
}

interface NotificationItem extends NotificationOptions {
  id: number;
}

interface NotificationContextValue {
  notify: (opts: NotificationOptions) => void;
}

/* ─── Context ────────────────────────────────────────── */
const NotificationContext = createContext<NotificationContextValue | null>(null);

export function useNotification(): NotificationContextValue {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotification must be used inside <NotificationProvider>");
  return ctx;
}

/* ─── Config per type ────────────────────────────────── */
const CONFIG: Record<
  NotificationType,
  { icon: React.ReactNode; border: string; iconColor: string; bg: string }
> = {
  success: {
    icon: <CheckCircle size={18} />,
    border: "border-emerald-500/40",
    iconColor: "text-emerald-400",
    bg: "bg-emerald-500/10",
  },
  error: {
    icon: <XCircle size={18} />,
    border: "border-red-500/40",
    iconColor: "text-red-400",
    bg: "bg-red-500/10",
  },
  warning: {
    icon: <AlertTriangle size={18} />,
    border: "border-amber-500/40",
    iconColor: "text-amber-400",
    bg: "bg-amber-500/10",
  },
  info: {
    icon: <Info size={18} />,
    border: "border-oil-cyan/40",
    iconColor: "text-oil-cyan",
    bg: "bg-oil-cyan/10",
  },
};

/* ─── Single Toast ───────────────────────────────────── */
interface ToastProps {
  readonly item: NotificationItem;
  readonly onDismiss: (id: number) => void;
}

function Toast({ item, onDismiss }: ToastProps) {
  const cfg = CONFIG[item.type];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 60, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 60, scale: 0.92 }}
      transition={{ type: "spring", stiffness: 300, damping: 28 }}
      className={`relative flex items-start gap-3 w-80 max-w-[calc(100vw-2rem)] rounded-2xl border ${cfg.border} glass-strong px-4 py-3.5 shadow-2xl`}
    >
      {/* Icon */}
      <div className={`shrink-0 mt-0.5 rounded-xl p-1.5 ${cfg.bg}`}>
        <span className={cfg.iconColor}>{cfg.icon}</span>
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white leading-snug">{item.title}</p>
        {item.message && (
          <p className="text-xs text-gray-400 mt-0.5 leading-relaxed line-clamp-2">
            {item.message}
          </p>
        )}
      </div>

      {/* Close */}
      <button
        onClick={() => onDismiss(item.id)}
        className="shrink-0 mt-0.5 text-gray-600 hover:text-gray-300 transition-colors cursor-pointer"
        aria-label="Dismiss notification"
      >
        <X size={15} />
      </button>

      {/* Progress bar (shows duration countdown) */}
      {(item.duration ?? 4000) > 0 && (
        <motion.div
          className={`absolute bottom-0 left-0 h-0.5 rounded-b-2xl ${cfg.iconColor.replace("text-", "bg-")}`}
          initial={{ width: "100%" }}
          animate={{ width: "0%" }}
          transition={{ duration: (item.duration ?? 4000) / 1000, ease: "linear" }}
        />
      )}
    </motion.div>
  );
}

/* ─── Container ──────────────────────────────────────── */
interface ContainerProps {
  readonly items: NotificationItem[];
  readonly onDismiss: (id: number) => void;
}

function NotificationContainer({ items, onDismiss }: ContainerProps) {
  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col-reverse gap-3 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {items.map((item) => (
          <div key={item.id} className="pointer-events-auto">
            <Toast item={item} onDismiss={onDismiss} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}

/* ─── Provider ───────────────────────────────────────── */
interface ProviderProps {
  readonly children: React.ReactNode;
}

export function NotificationProvider({ children }: ProviderProps) {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const counter = useRef(0);

  const dismiss = useCallback((id: number) => {
    setItems((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const notify = useCallback((opts: NotificationOptions) => {
    const id = ++counter.current;
    setItems((prev) => [...prev, { ...opts, id }]);

    const delay = opts.duration ?? 4000;
    if (delay > 0) {
      setTimeout(() => dismiss(id), delay);
    }
  }, [dismiss]);

  const contextValue = useMemo(() => ({ notify }), [notify]);

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
      <NotificationContainer items={items} onDismiss={dismiss} />
    </NotificationContext.Provider>
  );
}
