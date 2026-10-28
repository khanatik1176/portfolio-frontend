"use client";

import { useState, type FormEvent } from "react";
import type { Section, SiteSettings } from "@/lib/types";
import { SectionShell } from "./SectionShell";

type Status = "idle" | "sending" | "sent" | "error";

export function Contact({ section, settings }: { section: Section; settings: SiteSettings }) {
  const [status, setStatus] = useState<Status>("idle");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setStatus("sending");
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(new FormData(form))),
    }).catch(() => null);
    if (res?.ok) {
      form.reset();
      setStatus("sent");
    } else {
      setStatus("error");
    }
  }

  const input = "w-full rounded-lg border border-line bg-transparent px-4 py-3 outline-none focus:border-accent";

  return (
    <SectionShell section={section}>
      <form onSubmit={onSubmit} className="grid max-w-xl gap-4">
        <input name="name" required placeholder="Your name" className={input} />
        <input name="email" type="email" required placeholder="Email" className={input} />
        <textarea name="message" required rows={5} placeholder="Message" className={input} />
        <button
          disabled={status === "sending"}
          className="w-fit rounded-full bg-accent px-6 py-3 font-medium text-white disabled:opacity-50"
        >
          {status === "sending" ? "Sending…" : "Send message"}
        </button>
        {status === "sent" && <p className="text-green-600">Thanks! I&apos;ll get back to you soon.</p>}
        {status === "error" && <p className="text-red-600">Something went wrong. Please try again.</p>}
      </form>
      {settings.email && (
        <p className="mt-8 text-muted">
          Or email me at{" "}
          <a href={`mailto:${settings.email}`} className="text-accent">
            {settings.email}
          </a>
        </p>
      )}
    </SectionShell>
  );
}
