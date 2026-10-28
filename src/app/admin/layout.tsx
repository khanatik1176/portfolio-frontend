"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useSyncExternalStore, type ReactNode } from "react";
import { clsx } from "clsx";
import { auth } from "@/lib/api";

const NAV = [
  { href: "/admin", label: "Site settings" },
  { href: "/admin/sections", label: "Sections" },
  { href: "/admin/messages", label: "Messages" },
];

const subscribeNoop = () => () => {};

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isLogin = pathname === "/admin/login";
  // null on the server; the token lives in localStorage.
  const loggedIn = useSyncExternalStore(
    subscribeNoop,
    () => Boolean(auth.getToken()),
    () => null,
  );

  useEffect(() => {
    if (!isLogin && loggedIn === false) router.replace("/admin/login");
  }, [isLogin, loggedIn, router]);

  if (isLogin) return <>{children}</>;
  if (!loggedIn) return null;

  return (
    <div className="flex min-h-screen">
      <aside className="w-56 shrink-0 border-r border-border p-4">
        <p className="mb-6 px-2 font-semibold">Portfolio Admin</p>
        <nav className="grid gap-1">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "rounded-md px-2 py-1.5 text-sm",
                pathname === item.href ? "bg-muted font-medium" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="mt-8 grid gap-1 border-t border-border pt-4 text-sm">
          <a href="/" target="_blank" className="px-2 py-1.5 text-muted-foreground hover:text-foreground">
            View site ↗
          </a>
          <button
            onClick={() => {
              auth.clear();
              router.replace("/admin/login");
            }}
            className="px-2 py-1.5 text-left text-muted-foreground hover:text-foreground"
          >
            Log out
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-x-auto p-8">{children}</main>
    </div>
  );
}
