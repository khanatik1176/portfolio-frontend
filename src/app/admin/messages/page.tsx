"use client";

import { useCallback, useEffect, useState } from "react";
import { Button, Card, ErrorText } from "@/components/admin/ui";
import { api } from "@/lib/api";
import type { ContactMessage } from "@/lib/types";

export default function MessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    () => api<ContactMessage[]>("/messages").then(setMessages, (e) => setError(e.message)),
    [],
  );

  useEffect(() => {
    void load();
  }, [load]);

  async function act(path: string, method: string) {
    await api(path, { method });
    await load();
  }

  return (
    <div className="grid max-w-3xl gap-4">
      <h1 className="text-2xl font-semibold">Messages</h1>
      <ErrorText error={error} />
      {messages.length === 0 && <p className="text-muted-foreground">No messages yet.</p>}
      {messages.map((m) => (
        <Card key={m.id} className={m.isRead ? "opacity-60" : ""}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-medium">
                {m.name} <span className="font-normal text-muted-foreground">&lt;{m.email}&gt;</span>
              </p>
              <p className="text-xs text-muted-foreground">{new Date(m.createdAt).toLocaleString()}</p>
            </div>
            <div className="flex gap-1">
              <Button variant="ghost" onClick={() => act(`/messages/${m.id}/read?value=${!m.isRead}`, "PATCH")}>
                Mark {m.isRead ? "unread" : "read"}
              </Button>
              <Button variant="danger" onClick={() => confirm("Delete this message?") && act(`/messages/${m.id}`, "DELETE")}>
                Delete
              </Button>
            </div>
          </div>
          {m.subject && <p className="mt-3 font-medium">{m.subject}</p>}
          <p className="mt-2 whitespace-pre-line text-sm">{m.message}</p>
        </Card>
      ))}
    </div>
  );
}
