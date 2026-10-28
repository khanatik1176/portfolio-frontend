import type { ComponentProps, ReactNode } from "react";
import { clsx } from "clsx";

export const inputClass =
  "w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary";

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="grid gap-1 text-sm">
      <span className="font-medium text-muted-foreground">{label}</span>
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
        variant === "primary" && "bg-primary text-primary-foreground hover:opacity-90",
        variant === "ghost" && "border border-border hover:bg-muted",
        variant === "danger" && "text-red-600 hover:bg-red-500/10",
        className,
      )}
    />
  );
}

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={clsx("rounded-lg border border-border p-6", className)}>{children}</div>;
}

export function ErrorText({ error }: { error: string | null }) {
  return error ? <p className="text-sm text-red-600">{error}</p> : null;
}
