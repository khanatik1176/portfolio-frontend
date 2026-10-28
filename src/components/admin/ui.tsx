import type { ComponentProps, ReactNode } from "react";
import { clsx } from "clsx";

export const inputClass =
  "w-full rounded-md border border-line bg-background px-3 py-2 text-sm outline-none focus:border-accent";

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="grid gap-1 text-sm">
      <span className="font-medium text-muted">{label}</span>
      {children}
    </label>
  );
}

export function Button({
  variant = "primary",
  className,
  ...props
}: ComponentProps<"button"> & { variant?: "primary" | "ghost" | "danger" }) {
  return (
    <button
      {...props}
      className={clsx(
        "rounded-md px-3 py-2 text-sm font-medium transition disabled:opacity-50",
        variant === "primary" && "bg-accent text-white hover:opacity-90",
        variant === "ghost" && "border border-line hover:bg-surface",
        variant === "danger" && "text-red-600 hover:bg-red-500/10",
        className,
      )}
    />
  );
}

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={clsx("rounded-xl border border-line p-6", className)}>{children}</div>;
}

export function ErrorText({ error }: { error: string | null }) {
  return error ? <p className="text-sm text-red-600">{error}</p> : null;
}
