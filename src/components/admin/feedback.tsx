"use client";

import { AnimatePresence, motion } from "motion/react";
import { CircleAlert, CircleCheck } from "lucide-react";
import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Button } from "./ui";

interface Toast {
  id: number;
  tone: "success" | "error";
  message: string;
}

interface ConfirmOptions {
  title: string;
  description?: string;
  confirmLabel?: string;
  danger?: boolean;
}

interface Feedback {
  toast: (message: string, tone?: Toast["tone"]) => void;
  /** Styled replacement for window.confirm; resolves true when confirmed. */
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const FeedbackContext = createContext<Feedback | null>(null);

export function useFeedback() {
  const ctx = useContext(FeedbackContext);
  if (!ctx)
    throw new Error("useFeedback must be used inside <FeedbackProvider>");
  return ctx;
}

/** Toasts in the bottom-right corner and a single confirm dialog for the admin. */
export function FeedbackProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [dialog, setDialog] = useState<ConfirmOptions | null>(null);
  const resolver = useRef<((ok: boolean) => void) | null>(null);
  const nextId = useRef(0);

  const toast = useCallback<Feedback["toast"]>((message, tone = "success") => {
    const id = ++nextId.current;
    setToasts((t) => [...t, { id, tone, message }]);
    setTimeout(
      () => setToasts((t) => t.filter((x) => x.id !== id)),
      tone === "error" ? 6000 : 3000,
    );
  }, []);

  const confirm = useCallback<Feedback["confirm"]>(
    (options) =>
      new Promise((resolve) => {
        resolver.current = resolve;
        setDialog(options);
      }),
    [],
  );

  const close = (ok: boolean) => {
    resolver.current?.(ok);
    resolver.current = null;
    setDialog(null);
  };

  return (
    <FeedbackContext.Provider value={{ toast, confirm }}>
      {children}

      <div
        aria-live="polite"
        className="pointer-events-none fixed right-4 bottom-4 z-[60] grid w-[min(22rem,calc(100vw-2rem))] gap-2"
      >
        <AnimatePresence initial={false}>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 40 }}
              className="pointer-events-auto flex items-start gap-2.5 rounded-xl border border-border bg-popover px-3.5 py-3 text-sm shadow-lg"
            >
              {t.tone === "success" ? (
                <CircleCheck className="mt-px size-4 shrink-0 text-chart-3" />
              ) : (
                <CircleAlert className="mt-px size-4 shrink-0 text-destructive" />
              )}
              <span className="min-w-0 break-words">{t.message}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {dialog && (
          <div className="fixed inset-0 z-[70] grid place-items-center p-4">
            <motion.div
              className="absolute inset-0 bg-background/70 backdrop-blur-sm"
              onClick={() => close(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            <motion.div
              role="alertdialog"
              aria-modal
              aria-labelledby="confirm-title"
              className="relative w-full max-w-sm rounded-xl border border-border bg-card p-5 shadow-xl"
              initial={{ opacity: 0, scale: 0.95, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onKeyDown={(e) => e.key === "Escape" && close(false)}
            >
              <h2 id="confirm-title" className="font-semibold">
                {dialog.title}
              </h2>
              {dialog.description && (
                <p className="mt-1.5 text-sm text-muted-foreground">
                  {dialog.description}
                </p>
              )}
              <div className="mt-5 flex justify-end gap-2">
                <Button variant="secondary" onClick={() => close(false)}>
                  Cancel
                </Button>
                <Button
                  autoFocus
                  onClick={() => close(true)}
                  className={
                    dialog.danger
                      ? "bg-destructive text-destructive-foreground shadow-none hover:bg-destructive/85"
                      : undefined
                  }
                >
                  {dialog.confirmLabel ?? "Confirm"}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </FeedbackContext.Provider>
  );
}
