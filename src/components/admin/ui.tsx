"use client";

import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";
import { useEffect, type ComponentProps, type ReactNode } from "react";
import { clsx } from "clsx";

// Autofill would otherwise paint inputs in the browser's light yellow.
export const inputClass =
  "w-full rounded-lg border border-border bg-background/70 px-3 py-2 text-sm text-foreground outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-muted-foreground/50 hover:border-[color-mix(in_oklch,var(--foreground)_22%,var(--border))] focus:border-primary/70 focus:shadow-[0_0_0_3px_color-mix(in_oklch,var(--primary)_18%,transparent)] disabled:opacity-60 [&:-webkit-autofill]:shadow-[inset_0_0_0_100px_var(--card)] [&:-webkit-autofill]:[-webkit-text-fill-color:var(--foreground)]";

export function Field({
  label,
  hint,
  className,
  children,
}: {
  label: string;
  hint?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <label className={clsx("grid content-start gap-1.5 text-sm", className)}>
      <span className="font-medium text-foreground/85">{label}</span>
      {children}
      {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
    </label>
  );
}

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

/** Button styling, also for links that should look like buttons. */
export function buttonClass(
  variant: ButtonVariant = "primary",
  size: "sm" | "md" = "md",
  className?: string,
) {
  return clsx(
    "inline-flex items-center justify-center gap-2 rounded-lg font-medium whitespace-nowrap transition duration-150 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40 [&_svg]:size-4 [&_svg]:shrink-0",
    size === "md" ? "h-9 px-3.5 text-sm" : "h-8 px-2.5 text-xs",
    variant === "primary" &&
      "bg-primary font-semibold text-primary-foreground shadow-[0_6px_20px_-10px_var(--primary)] hover:bg-[color-mix(in_oklch,var(--primary)_88%,white)]",
    variant === "secondary" &&
      "border border-border bg-card hover:border-primary/40 hover:bg-muted",
    variant === "ghost" &&
      "text-muted-foreground hover:bg-muted hover:text-foreground",
    variant === "danger" && "text-destructive hover:bg-destructive/10",
    className,
  );
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ComponentProps<"button"> & { variant?: ButtonVariant; size?: "sm" | "md" }) {
  return (
    <button {...props} className={buttonClass(variant, size, className)} />
  );
}

/** Square icon-only button; `label` is required for screen readers and the tooltip. */
export function IconButton({
  label,
  className,
  tone = "default",
  ...props
}: ComponentProps<"button"> & { label: string; tone?: "default" | "danger" }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      {...props}
      className={clsx(
        "inline-grid size-8 shrink-0 place-items-center rounded-lg text-muted-foreground transition-colors disabled:pointer-events-none disabled:opacity-30 [&_svg]:size-4",
        tone === "danger"
          ? "hover:bg-destructive/10 hover:text-destructive"
          : "hover:bg-muted hover:text-foreground",
        className,
      )}
    />
  );
}

export function Card({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={clsx(
        "rounded-xl border border-border bg-card/80 shadow-sm",
        className,
      )}
    >
      {children}
    </div>
  );
}

/** Card heading row: title and description on the left, actions on the right. */
export function CardHeader({
  title,
  description,
  children,
}: {
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border px-5 py-4">
      <div className="min-w-0">
        <h2 className="font-semibold">{title}</h2>
        {description && (
          <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {children && (
        <div className="flex shrink-0 items-center gap-2">{children}</div>
      )}
    </div>
  );
}

export function PageHeader({
  title,
  description,
  children,
}: {
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        <h1 className="font-display text-2xl font-bold tracking-tight sm:text-[1.7rem]">
          {title}
        </h1>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {children && (
        <div className="flex flex-wrap items-center gap-2">{children}</div>
      )}
    </div>
  );
}

const BADGE_TONES = {
  neutral: "border-border bg-muted text-muted-foreground",
  primary: "border-primary/30 bg-primary/10 text-primary",
  purple: "border-secondary/40 bg-secondary/15 text-accent-foreground",
  success: "border-chart-3/30 bg-chart-3/10 text-chart-3",
  danger: "border-destructive/30 bg-destructive/10 text-destructive",
};

export function Badge({
  tone = "neutral",
  className,
  children,
}: {
  tone?: keyof typeof BADGE_TONES;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[11px] font-medium whitespace-nowrap",
        BADGE_TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function Switch({
  checked,
  onChange,
  label,
  disabled,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={clsx(
        "relative inline-flex h-5 w-9 shrink-0 items-center rounded-full border transition-colors disabled:opacity-40",
        checked ? "border-primary/60 bg-primary" : "border-border bg-muted",
      )}
    >
      <span
        className={clsx(
          "size-3.5 rounded-full shadow transition-transform duration-200",
          checked
            ? "translate-x-[18px] bg-primary-foreground"
            : "translate-x-[3px] bg-muted-foreground",
        )}
      />
    </button>
  );
}

/** Underlined tab strip. */
export function Tabs<T extends string>({
  value,
  onChange,
  tabs,
  layoutId,
}: {
  value: T;
  onChange: (value: T) => void;
  tabs: { value: T; label: ReactNode }[];
  layoutId: string;
}) {
  return (
    <div
      role="tablist"
      className="flex gap-1 overflow-x-auto border-b border-border"
    >
      {tabs.map((t) => (
        <button
          key={t.value}
          type="button"
          role="tab"
          aria-selected={value === t.value}
          onClick={() => onChange(t.value)}
          className={clsx(
            "relative flex shrink-0 items-center gap-1.5 px-3 pt-1 pb-2.5 text-sm transition-colors",
            value === t.value
              ? "font-medium text-foreground"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {t.label}
          {value === t.value && (
            <motion.span
              layoutId={layoutId}
              className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-primary"
            />
          )}
        </button>
      ))}
    </div>
  );
}

/** Pill-style switcher for a handful of options (e.g. device widths). */
export function Segmented<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (value: T) => void;
  options: { value: T; label: string; icon?: ReactNode }[];
}) {
  return (
    <div className="inline-flex rounded-lg border border-border bg-background/60 p-0.5">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          aria-pressed={value === o.value}
          title={o.label}
          onClick={() => onChange(o.value)}
          className={clsx(
            "inline-flex h-7 items-center gap-1.5 rounded-md px-2 text-xs font-medium transition-colors [&_svg]:size-3.5",
            value === o.value
              ? "bg-muted text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {o.icon}
          <span className={o.icon ? "hidden sm:inline" : undefined}>
            {o.label}
          </span>
        </button>
      ))}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return (
    <div className={clsx("animate-pulse rounded-lg bg-muted", className)} />
  );
}

export function EmptyState({
  icon,
  title,
  description,
  children,
}: {
  icon: ReactNode;
  title: string;
  description?: string;
  children?: ReactNode;
}) {
  return (
    <div className="grid place-items-center gap-2 px-6 py-14 text-center">
      <div className="mb-1 grid size-11 place-items-center rounded-xl border border-border bg-muted text-muted-foreground [&_svg]:size-5">
        {icon}
      </div>
      <p className="font-medium">{title}</p>
      {description && (
        <p className="max-w-xs text-sm text-muted-foreground">{description}</p>
      )}
      {children && <div className="mt-2">{children}</div>}
    </div>
  );
}

export function ErrorText({ error }: { error: string | null }) {
  return error ? (
    <p
      role="alert"
      className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
    >
      {error}
    </p>
  ) : null;
}

export function Kbd({ children }: { children: ReactNode }) {
  return (
    <kbd className="rounded border border-border bg-muted px-1 font-mono text-[10px] text-muted-foreground">
      {children}
    </kbd>
  );
}

/** Panel that slides in from the right over a dimmed page; Escape or the backdrop closes it. */
export function Drawer({
  open,
  onClose,
  title,
  description,
  footer,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  description?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50">
          <motion.div
            className="absolute inset-0 bg-background/70 backdrop-blur-sm"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.aside
            role="dialog"
            aria-modal
            className="absolute inset-y-0 right-0 flex w-full max-w-xl flex-col border-l border-border bg-card shadow-xl"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 380, damping: 38 }}
          >
            <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
              <div className="min-w-0">
                <h2 className="font-semibold">{title}</h2>
                {description && (
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {description}
                  </p>
                )}
              </div>
              <IconButton label="Close" onClick={onClose}>
                <X />
              </IconButton>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-5">{children}</div>
            {footer && (
              <div className="flex items-center justify-end gap-2 border-t border-border px-5 py-3">
                {footer}
              </div>
            )}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
