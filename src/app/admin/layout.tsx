"use client";

import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  ChevronRight,
  ExternalLink,
  Inbox,
  LayoutDashboard,
  LayoutList,
  LogOut,
  Menu,
  Settings,
  X,
  type LucideIcon,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import {
  useEffect,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { clsx } from "clsx";
import { FeedbackProvider } from "@/components/admin/feedback";
import { MotionProvider } from "@/components/fx/MotionProvider";
import { MESSAGES_CHANGED } from "@/components/admin/meta";
import { IconButton } from "@/components/admin/ui";
import { LogoMark } from "@/components/fx/Logo";
import { api, auth } from "@/lib/api";
import type { ContactMessage, SiteSettings } from "@/lib/types";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  badge?: "unread";
}

const NAV: { group: string; items: NavItem[] }[] = [
  {
    group: "General",
    items: [{ href: "/admin", label: "Overview", icon: LayoutDashboard }],
  },
  {
    group: "Content",
    items: [
      { href: "/admin/sections", label: "Sections", icon: LayoutList },
      { href: "/admin/settings", label: "Site settings", icon: Settings },
    ],
  },
  {
    group: "Inbox",
    items: [
      {
        href: "/admin/messages",
        label: "Messages",
        icon: Inbox,
        badge: "unread",
      },
    ],
  },
];

const ALL_ITEMS = NAV.flatMap((g) => g.items);

// Routes rendered without the admin shell. The preview runs inside an iframe.
const BARE_ROUTES = ["/admin/login", "/admin/preview"];

const subscribeNoop = () => () => {};

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const bare = BARE_ROUTES.includes(pathname);
  // null on the server; the token lives in localStorage.
  const loggedIn = useSyncExternalStore(
    subscribeNoop,
    () => Boolean(auth.getToken()),
    () => null,
  );

  useEffect(() => {
    if (!bare && loggedIn === false) router.replace("/admin/login");
  }, [bare, loggedIn, router]);

  if (bare) return <>{children}</>;
  // Render the shell while the token is still unknown (server pass) so Next.js
  // can validate the page for instant navigation; pages fetch only in effects.
  if (loggedIn === false) return null;

  return (
    <MotionProvider>
      <FeedbackProvider>
        <AdminShell enabled={loggedIn === true}>{children}</AdminShell>
      </FeedbackProvider>
    </MotionProvider>
  );
}

function AdminShell({
  enabled,
  children,
}: {
  enabled: boolean;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const reduce = useReducedMotion();
  const [unread, setUnread] = useState(0);
  const [owner, setOwner] = useState<Pick<
    SiteSettings,
    "ownerName" | "email" | "avatarUrl"
  > | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    const loadUnread = () =>
      api<ContactMessage[]>("/messages").then(
        (m) => setUnread(m.filter((x) => !x.isRead).length),
        () => {},
      );
    void loadUnread();
    api<SiteSettings>("/settings").then(setOwner, () => {});
    window.addEventListener(MESSAGES_CHANGED, loadUnread);
    return () => window.removeEventListener(MESSAGES_CHANGED, loadUnread);
  }, [enabled]);

  const logOut = () => {
    auth.clear();
    router.replace("/admin/login");
  };

  const current = ALL_ITEMS.find((i) => i.href === pathname);

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center gap-2.5 px-4">
        <LogoMark className="size-8" />
        <div className="min-w-0 leading-tight">
          <p className="font-display text-sm font-bold">Backstage</p>
          <p className="text-xs text-muted-foreground">Portfolio CMS</p>
        </div>
      </div>

      <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-3">
        {NAV.map((group) => (
          <div key={group.group}>
            <p className="mb-1.5 px-2.5 text-[11px] font-medium tracking-wider text-muted-foreground/70 uppercase">
              {group.group}
            </p>
            <div className="grid gap-0.5">
              {group.items.map((item) => {
                const active = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={clsx(
                      "relative flex h-9 items-center gap-2.5 rounded-lg px-2.5 text-sm transition-colors",
                      active
                        ? "font-medium text-foreground"
                        : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                    )}
                  >
                    {active && (
                      <motion.span
                        layoutId="admin-nav-active"
                        className="absolute inset-0 rounded-lg border border-border bg-muted"
                        transition={
                          reduce
                            ? { duration: 0 }
                            : { type: "spring", stiffness: 420, damping: 34 }
                        }
                      />
                    )}
                    {active && (
                      <span className="absolute top-2 bottom-2 -left-3 w-0.5 rounded-full bg-primary" />
                    )}
                    <Icon
                      className={clsx(
                        "relative size-4",
                        active && "text-primary",
                      )}
                    />
                    <span className="relative flex-1">{item.label}</span>
                    {item.badge === "unread" && unread > 0 && (
                      <span className="relative rounded-full bg-primary px-1.5 text-[11px] leading-[18px] font-semibold text-primary-foreground">
                        {unread}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-border p-3">
        <a
          href="/"
          target="_blank"
          className="mb-2 flex h-9 items-center gap-2.5 rounded-lg px-2.5 text-sm text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
        >
          <ExternalLink className="size-4" />
          View live site
        </a>
        <div className="flex items-center gap-2.5 rounded-lg border border-border bg-background/50 p-2">
          {owner?.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- arbitrary admin-provided URL
            <img
              src={owner.avatarUrl}
              alt=""
              className="size-8 rounded-full object-cover"
            />
          ) : (
            <span className="grid size-8 place-items-center rounded-full bg-secondary text-xs font-semibold text-secondary-foreground">
              {(owner?.ownerName || "A").slice(0, 1)}
            </span>
          )}
          <div className="min-w-0 flex-1 leading-tight">
            <p className="truncate text-sm font-medium">
              {owner?.ownerName || "Admin"}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {owner?.email || "Signed in"}
            </p>
          </div>
          <IconButton label="Log out" tone="danger" onClick={logOut}>
            <LogOut />
          </IconButton>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[radial-gradient(60rem_30rem_at_100%_-10%,color-mix(in_oklch,var(--secondary)_14%,transparent),transparent)] lg:pl-64">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-border bg-sidebar lg:block">
        {sidebar}
      </aside>

      <AnimatePresence>
        {mobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <motion.div
              className="absolute inset-0 bg-background/70 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            <motion.aside
              className="absolute inset-y-0 left-0 w-72 max-w-[85vw] border-r border-border bg-sidebar"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 380, damping: 38 }}
            >
              <IconButton
                label="Close menu"
                className="absolute top-4 right-3"
                onClick={() => setMobileOpen(false)}
              >
                <X />
              </IconButton>
              {sidebar}
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-border bg-background/75 px-4 backdrop-blur-xl sm:px-6">
        <IconButton
          label="Open menu"
          className="-ml-1 lg:hidden"
          onClick={() => setMobileOpen(true)}
        >
          <Menu />
        </IconButton>
        <nav
          aria-label="Breadcrumb"
          className="flex min-w-0 items-center gap-1.5 text-sm"
        >
          <Link
            href="/admin"
            className="text-muted-foreground hover:text-foreground"
          >
            Admin
          </Link>
          {current && current.href !== "/admin" && (
            <>
              <ChevronRight className="size-3.5 shrink-0 text-muted-foreground/60" />
              <span className="truncate font-medium">{current.label}</span>
            </>
          )}
          {current?.href === "/admin" && (
            <>
              <ChevronRight className="size-3.5 shrink-0 text-muted-foreground/60" />
              <span className="font-medium">Overview</span>
            </>
          )}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <span className="hidden items-center gap-1.5 rounded-full border border-chart-3/30 bg-chart-3/10 px-2.5 py-1 text-xs text-chart-3 sm:inline-flex">
            <span className="size-1.5 rounded-full bg-chart-3" />
            Live
          </span>
        </div>
      </header>

      <motion.main
        key={pathname}
        className="min-w-0 px-4 py-6 sm:px-6 lg:px-8 lg:py-8"
        initial={reduce ? false : { opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
      >
        {children}
      </motion.main>
    </div>
  );
}
