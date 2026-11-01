"use client";

import { ArrowUpRight, Copy, CornerDownLeft, FileText, Hash, Mail, Search } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { SocialIcon } from "./SocialIcon";

const OPEN_EVENT = "open-palette";

/** Opens the palette from anywhere (nav buttons, mobile bar). */
export const openPalette = () => window.dispatchEvent(new Event(OPEN_EVENT));

interface Command {
  id: string;
  group: "Navigate" | "Actions" | "Links";
  label: string;
  hint?: string;
  icon: ReactNode;
  run: () => void;
}

export interface PaletteData {
  sections: { slug: string; label: string }[];
  email: string | null;
  resumeUrl: string | null;
  cvFileName?: string;
  socials: { platform: string; url: string }[];
  papers: { title: string; url: string }[];
}

/** ⌘K / Ctrl+K launcher: jump to any section, copy the email, open profiles and papers. */
export function CommandPalette({ data }: { data: PaletteData }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [toast, setToast] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);

  const commands = useMemo<Command[]>(() => {
    const go = (slug: string) => () => document.getElementById(slug)?.scrollIntoView({ behavior: "smooth" });
    const visit = (url: string) => () => window.open(url, "_blank", "noopener");
    const list: Command[] = data.sections.map((s) => ({
      id: `go-${s.slug}`,
      group: "Navigate",
      label: s.label,
      icon: <Hash className="h-4 w-4" />,
      run: go(s.slug),
    }));
    if (data.email) {
      const email = data.email;
      list.push(
        {
          id: "copy-email",
          group: "Actions",
          label: "Copy email address",
          hint: email,
          icon: <Copy className="h-4 w-4" />,
          run: () => {
            navigator.clipboard?.writeText(email).then(() => setToast("Email copied"), () => {});
          },
        },
        {
          id: "mail",
          group: "Actions",
          label: "Send an email",
          icon: <Mail className="h-4 w-4" />,
          run: () => window.location.assign(`mailto:${email}`),
        },
      );
    }
    if (data.resumeUrl) {
      const url = data.resumeUrl;
      list.push({
        id: "resume",
        group: "Actions",
        label: "Download CV",
        hint: "PDF",
        icon: <FileText className="h-4 w-4" />,
        run: () => {
          const a = document.createElement("a");
          a.href = url;
          a.download = data.cvFileName ?? "";
          a.click();
        },
      });
    }
    data.socials.forEach((s, i) => {
      list.push({
        id: `social-${i}`,
        group: "Links",
        label: s.platform.replace(/^\w/, (c) => c.toUpperCase()),
        hint: s.url.replace(/^https?:\/\/(www\.)?/, ""),
        icon: <SocialIcon platform={s.platform} />,
        run: visit(s.url),
      });
    });
    data.papers.forEach((p, i) => {
      list.push({ id: `paper-${i}`, group: "Links", label: p.title, hint: "Paper", icon: <FileText className="h-4 w-4" />, run: visit(p.url) });
    });
    return list;
  }, [data]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return commands;
    return commands.filter((c) => `${c.label} ${c.hint ?? ""} ${c.group}`.toLowerCase().includes(q));
  }, [commands, query]);

  // Global shortcut plus the custom open event.
  useEffect(() => {
    const show = () => {
      returnFocus.current = document.activeElement as HTMLElement | null;
      setQuery("");
      setActive(0);
      setOpen(true);
    };
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (open) setOpen(false);
        else show();
      }
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener(OPEN_EVENT, show);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener(OPEN_EVENT, show);
    };
  }, [open]);

  useEffect(() => {
    if (open) requestAnimationFrame(() => inputRef.current?.focus());
    else returnFocus.current?.focus?.();
  }, [open]);

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 1800);
    return () => clearTimeout(id);
  }, [toast]);

  useEffect(() => {
    listRef.current?.querySelector(`[data-index="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [active]);

  const run = (cmd: Command | undefined) => {
    if (!cmd) return;
    setOpen(false);
    // Let the dialog close (and focus return) before scrolling or navigating.
    requestAnimationFrame(cmd.run);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      run(results[active]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 px-4 pt-[12vh] backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onMouseDown={(e) => e.target === e.currentTarget && setOpen(false)}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="Command menu"
              className="w-full max-w-lg overflow-hidden rounded-xl border bg-popover text-popover-foreground shadow-xl"
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.15 }}
              onKeyDown={onKeyDown}
            >
              <div className="flex items-center gap-3 border-b px-4">
                <Search className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setActive(0);
                  }}
                  placeholder="Jump to a section, copy email, open links…"
                  className="h-12 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                  role="combobox"
                  aria-expanded="true"
                  aria-controls="palette-list"
                  aria-activedescendant={results[active] ? `cmd-${results[active].id}` : undefined}
                />
                <kbd className="rounded border px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">esc</kbd>
              </div>
              <ul id="palette-list" ref={listRef} role="listbox" className="max-h-[50vh] overflow-y-auto p-2">
                {results.length === 0 && <li className="px-3 py-8 text-center text-sm text-muted-foreground">No results for “{query}”</li>}
                {results.map((cmd, i) => {
                  const header = cmd.group !== results[i - 1]?.group ? cmd.group : null;
                  return (
                    <li key={cmd.id} role="presentation">
                      {header && <p className="px-3 pt-3 pb-1.5 text-[11px] font-medium text-muted-foreground">{header}</p>}
                      <button
                        id={`cmd-${cmd.id}`}
                        type="button"
                        role="option"
                        aria-selected={i === active}
                        data-index={i}
                        tabIndex={-1}
                        onMouseMove={() => setActive(i)}
                        onClick={() => run(cmd)}
                        className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm ${
                          i === active ? "bg-muted text-foreground" : "text-muted-foreground"
                        }`}
                      >
                        <span className={i === active ? "text-highlight" : ""}>{cmd.icon}</span>
                        <span className="min-w-0 flex-1 truncate">{cmd.label}</span>
                        {cmd.hint && <span className="hidden max-w-[40%] truncate text-xs text-muted-foreground sm:block">{cmd.hint}</span>}
                        {i === active &&
                          (cmd.group === "Links" ? (
                            <ArrowUpRight className="h-3.5 w-3.5 shrink-0" aria-hidden />
                          ) : (
                            <CornerDownLeft className="h-3.5 w-3.5 shrink-0" aria-hidden />
                          ))}
                      </button>
                    </li>
                  );
                })}
              </ul>
              <div className="flex items-center gap-4 border-t px-4 py-2 font-mono text-[10px] text-muted-foreground">
                <span>↑↓ navigate</span>
                <span>↵ select</span>
                <span className="ml-auto">⌘K toggle</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toast && (
          <motion.p
            role="status"
            className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-foreground px-4 py-2 text-sm text-background shadow-lg"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
          >
            {toast}
          </motion.p>
        )}
      </AnimatePresence>
    </>
  );
}
