"use client";

import {
  ArrowLeft,
  Inbox,
  Mail,
  MailOpen,
  Reply,
  Search,
  Trash2,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { clsx } from "clsx";
import { useFeedback } from "@/components/admin/feedback";
import { notifyMessagesChanged, timeAgo } from "@/components/admin/meta";
import {
  buttonClass,
  Card,
  EmptyState,
  ErrorText,
  IconButton,
  inputClass,
  PageHeader,
  Segmented,
  Skeleton,
} from "@/components/admin/ui";
import { api } from "@/lib/api";
import type { ContactMessage } from "@/lib/types";

type Filter = "all" | "unread";

/** Two-pane inbox: list on the left, the open message on the right. Opening a message marks it read. */
export default function MessagesPage() {
  const { toast, confirm } = useFeedback();
  const [messages, setMessages] = useState<ContactMessage[] | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    () =>
      api<ContactMessage[]>("/messages").then(setMessages, (e) =>
        setError(e.message),
      ),
    [],
  );

  useEffect(() => {
    void load();
  }, [load]);

  async function setRead(m: ContactMessage, value: boolean) {
    setMessages(
      (list) =>
        list?.map((x) => (x.id === m.id ? { ...x, isRead: value } : x)) ?? null,
    );
    try {
      await api(`/messages/${m.id}/read?value=${value}`, { method: "PATCH" });
      notifyMessagesChanged();
    } catch (e) {
      toast((e as Error).message, "error");
      void load();
    }
  }

  function open(m: ContactMessage) {
    setOpenId(m.id);
    if (!m.isRead) void setRead(m, true);
  }

  async function remove(m: ContactMessage) {
    if (
      !(await confirm({
        title: "Delete this message?",
        description: `From ${m.name}. This can't be undone.`,
        confirmLabel: "Delete",
        danger: true,
      }))
    )
      return;
    try {
      await api(`/messages/${m.id}`, { method: "DELETE" });
      toast("Message deleted");
      setOpenId(null);
      notifyMessagesChanged();
      await load();
    } catch (e) {
      toast((e as Error).message, "error");
    }
  }

  const unread = messages?.filter((m) => !m.isRead).length ?? 0;
  const shown =
    messages?.filter(
      (m) =>
        (filter === "all" || !m.isRead) &&
        `${m.name} ${m.email} ${m.subject ?? ""} ${m.message}`
          .toLowerCase()
          .includes(query.toLowerCase()),
    ) ?? [];
  const current = messages?.find((m) => m.id === openId) ?? null;

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-6">
      <PageHeader
        title="Messages"
        description={
          messages
            ? `${unread} unread · ${messages.length} total`
            : "Loading your inbox…"
        }
      />
      <ErrorText error={error} />

      <Card className="grid min-h-[calc(100vh-14rem)] overflow-hidden lg:grid-cols-[22rem_minmax(0,1fr)]">
        {/* List */}
        <div
          className={clsx(
            "flex min-h-0 flex-col border-border lg:border-r",
            current && "hidden lg:flex",
          )}
        >
          <div className="grid gap-2 border-b border-border p-3">
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search messages"
                aria-label="Search messages"
                className={clsx(inputClass, "h-9 pl-8")}
              />
            </div>
            <Segmented
              value={filter}
              onChange={setFilter}
              options={[
                { value: "all", label: "All" },
                {
                  value: "unread",
                  label: `Unread${unread ? ` (${unread})` : ""}`,
                },
              ]}
            />
          </div>

          {!messages ? (
            <div className="grid gap-2 p-3">
              {[0, 1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-16" />
              ))}
            </div>
          ) : shown.length === 0 ? (
            <EmptyState
              icon={<Inbox />}
              title={messages.length ? "Nothing here" : "No messages yet"}
              description={
                messages.length
                  ? "No messages match this view."
                  : "Messages from your contact form land here."
              }
            />
          ) : (
            <ul className="flex-1 divide-y divide-border overflow-y-auto">
              {shown.map((m) => (
                <li key={m.id}>
                  <button
                    type="button"
                    onClick={() => open(m)}
                    className={clsx(
                      "relative flex w-full gap-3 px-4 py-3 text-left transition-colors",
                      openId === m.id ? "bg-muted" : "hover:bg-muted/40",
                    )}
                  >
                    {!m.isRead && (
                      <span
                        className="absolute top-1/2 left-1.5 size-1.5 -translate-y-1/2 rounded-full bg-primary"
                        aria-label="Unread"
                      />
                    )}
                    <span className="grid size-9 shrink-0 place-items-center rounded-full bg-secondary/30 text-sm font-semibold text-accent-foreground">
                      {m.name.slice(0, 1).toUpperCase()}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-baseline gap-2">
                        <span
                          className={clsx(
                            "truncate text-sm",
                            m.isRead ? "text-foreground/80" : "font-semibold",
                          )}
                        >
                          {m.name}
                        </span>
                        <span className="ml-auto shrink-0 text-[11px] text-muted-foreground">
                          {timeAgo(m.createdAt)}
                        </span>
                      </span>
                      <span
                        className={clsx(
                          "block truncate text-xs",
                          m.isRead
                            ? "text-muted-foreground"
                            : "text-foreground/90",
                        )}
                      >
                        {m.subject || "(no subject)"}
                      </span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {m.message}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Reading pane */}
        <div
          className={clsx(
            "min-w-0 flex-col",
            current ? "flex" : "hidden lg:flex",
          )}
        >
          {current ? (
            <>
              <div className="flex items-center gap-1 border-b border-border px-3 py-2">
                <IconButton
                  label="Back to list"
                  className="lg:hidden"
                  onClick={() => setOpenId(null)}
                >
                  <ArrowLeft />
                </IconButton>
                <div className="ml-auto flex items-center gap-1">
                  <IconButton
                    label={current.isRead ? "Mark as unread" : "Mark as read"}
                    onClick={() => setRead(current, !current.isRead)}
                  >
                    {current.isRead ? <Mail /> : <MailOpen />}
                  </IconButton>
                  <IconButton
                    label="Delete"
                    tone="danger"
                    onClick={() => remove(current)}
                  >
                    <Trash2 />
                  </IconButton>
                </div>
              </div>
              <article className="flex-1 overflow-y-auto p-6">
                <h2 className="font-display text-xl font-bold">
                  {current.subject || "(no subject)"}
                </h2>
                <div className="mt-4 flex items-center gap-3">
                  <span className="grid size-10 place-items-center rounded-full bg-secondary/30 font-semibold text-accent-foreground">
                    {current.name.slice(0, 1).toUpperCase()}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-medium">{current.name}</p>
                    <p className="truncate text-sm text-muted-foreground">
                      {current.email}
                    </p>
                  </div>
                  <p className="ml-auto shrink-0 text-xs text-muted-foreground">
                    {new Date(current.createdAt).toLocaleString("en-US", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </p>
                </div>
                <p className="mt-6 max-w-2xl text-sm leading-relaxed whitespace-pre-line text-foreground/90">
                  {current.message}
                </p>
                <div className="mt-8">
                  <a
                    href={`mailto:${current.email}?subject=${encodeURIComponent(`Re: ${current.subject ?? "your message"}`)}`}
                    className={buttonClass()}
                  >
                    <Reply /> Reply by email
                  </a>
                </div>
              </article>
            </>
          ) : (
            <div className="grid flex-1 place-items-center">
              <EmptyState
                icon={<Mail />}
                title="No message selected"
                description="Pick a message from the list to read it."
              />
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
