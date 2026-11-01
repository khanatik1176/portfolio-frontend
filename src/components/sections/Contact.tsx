"use client";

import { ArrowRight, Check, Copy, Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Reveal } from "../fx/Reveal";
import { SocialIcon } from "../fx/SocialIcon";
import { KineticTitle } from "../fx/KineticTitle";
import { VelocityMarquee } from "../fx/VelocityMarquee";
import { labelFromSlug, pad, type SectionProps } from "./types";

type Status = "idle" | "sending" | "sent" | "error";

const TOPICS = ["Job opportunity", "Freelance project", "Collaboration", "Just saying hi"];

const inputCls =
  "w-full rounded-lg border bg-background px-3.5 py-2.5 text-sm outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-primary";

/** "https://github.com/khanatik1176" → "khanatik1176". */
const handleOf = (url: string) => {
  try {
    return new URL(url).pathname.split("/").filter(Boolean).pop() ?? url;
  } catch {
    return url;
  }
};

/** Giant scroll-driven ticker above the contact panel, alternating solid and Joker-gradient words. */
function BigMarquee({ text }: { text: string }) {
  return (
    <div className="relative left-1/2 mb-12 w-screen -translate-x-1/2 py-4">
      <VelocityMarquee baseVelocity={-2.5}>
        {[0, 1, 2].map((i) => (
          <span key={i} className="flex items-center font-display text-6xl font-extrabold uppercase md:text-8xl">
            <span className={`px-8 ${i % 2 ? "" : "text-joker"}`}>{text}</span>
            <span className="text-primary">✦</span>
          </span>
        ))}
      </VelocityMarquee>
    </div>
  );
}

/** Closing call to action: a giant ticker, then a Joker-purple panel with direct channels beside the message form. */
export function Contact({ section, settings, index }: SectionProps) {
  return (
    <section id={section.slug} className="scroll-mt-20 py-24 md:py-32">
      <BigMarquee text="Let's work together" />
      <Reveal>
        <div className="relative overflow-hidden rounded-[2rem] bg-[linear-gradient(135deg,var(--secondary),oklch(0.3_0.16_300)_60%,oklch(0.22_0.1_300))] p-6 text-white sm:p-10 lg:p-16">
          <div aria-hidden className="pointer-events-none absolute -right-32 -bottom-32 h-96 w-96 rounded-full bg-primary/30 blur-[100px]" />
          <div aria-hidden className="bg-dots pointer-events-none absolute inset-0 opacity-40 [mask-image:linear-gradient(to_bottom,black,transparent)]" />
          <div className="relative grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
            <div className="flex flex-col">
              <p className="mb-4 flex items-center gap-3 font-mono text-xs text-white/60">
                <span className="rounded-md border border-white/25 px-1.5 py-0.5 text-primary">{pad(index)}</span>
                <span className="tracking-[0.18em] uppercase">{labelFromSlug(section.slug)}</span>
              </p>
              <h2 className="font-display text-4xl leading-[1.02] font-bold tracking-tight md:text-5xl lg:text-6xl">
                <KineticTitle text={section.title} />
              </h2>
              {section.subtitle && <p className="mt-5 max-w-md text-white/70">{section.subtitle}</p>}
              <div className="mt-10 lg:mt-auto lg:pt-10">
                <Channels email={settings.email} socials={settings.socials} />
              </div>
            </div>
            <MessageForm />
          </div>
        </div>
      </Reveal>
    </section>
  );
}

function Channels({ email, socials }: { email: string | null; socials: { platform: string; url: string }[] }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

  const copy = async () => {
    if (!email) return;
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard unavailable: the mailto link still works */
    }
  };

  return (
    <div className="grid gap-6">
      {email && (
        <div>
          <p className="text-xs text-white/50">Email me directly</p>
          <div className="mt-2 flex min-w-0 items-center gap-3">
            <a href={`mailto:${email}`} className="min-w-0 truncate text-lg sm:text-xl font-medium underline decoration-white/25 underline-offset-[6px] hover:decoration-primary md:text-2xl">
              {email}
            </a>
            <button
              type="button"
              onClick={copy}
              aria-label="Copy email address"
              className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-white/20 text-white/70 hover:bg-white/10 hover:text-white"
            >
              {copied ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>
          <p className="mt-1 h-4 text-xs text-primary" aria-live="polite">
            {copied && "Copied to clipboard"}
          </p>
        </div>
      )}
      {socials.length > 0 && (
        <ul className="flex flex-wrap gap-2">
          {socials.map((s) => (
            <li key={s.url}>
              <a
                href={s.url}
                target="_blank"
                rel="noreferrer"
                className="group inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-sm transition-colors hover:bg-primary hover:text-primary-foreground hover:border-primary"
              >
                <SocialIcon platform={s.platform} />
                <span className="capitalize">{s.platform}</span>
                <span className="text-white/50 group-hover:text-primary-foreground/70">{handleOf(s.url)}</span>
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function MessageForm() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [status, setStatus] = useState<Status>("idle");
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, subject: form.subject || undefined }),
    }).catch(() => null);
    setStatus(res?.ok ? "sent" : "error");
  }

  if (status === "sent") {
    return (
      <div className="grid h-full place-items-center rounded-3xl border border-white/10 bg-background/80 p-10 text-center text-foreground shadow-2xl backdrop-blur-xl">
        <div>
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-accent text-accent-foreground">
            <Check className="h-5 w-5" />
          </span>
          <p className="mt-4 font-medium">Thanks, {form.name.split(" ")[0]}. Your message is on its way.</p>
          <p className="mt-1 text-sm text-muted-foreground">I&apos;ll reply to {form.email} soon.</p>
          <button
            type="button"
            onClick={() => {
              setForm({ name: "", email: "", subject: "", message: "" });
              setStatus("idle");
            }}
            className="mt-6 text-sm font-medium text-highlight hover:underline"
          >
            Send another message
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="grid content-start gap-4 rounded-3xl border border-white/10 bg-background/80 p-6 text-foreground shadow-2xl backdrop-blur-xl md:p-8">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-1.5 text-sm">
          <span className="font-medium">Name</span>
          <input required maxLength={120} value={form.name} onChange={set("name")} placeholder="Jane Doe" className={inputCls} autoComplete="name" />
        </label>
        <label className="grid gap-1.5 text-sm">
          <span className="font-medium">Email</span>
          <input required type="email" value={form.email} onChange={set("email")} placeholder="jane@company.com" className={inputCls} autoComplete="email" />
        </label>
      </div>

      <fieldset className="grid gap-1.5 text-sm">
        <legend className="mb-1.5 font-medium">
          Topic <span className="font-normal text-muted-foreground">(optional)</span>
        </legend>
        <div className="flex flex-wrap gap-2">
          {TOPICS.map((t) => {
            const on = form.subject === t;
            return (
              <button
                key={t}
                type="button"
                aria-pressed={on}
                onClick={() => setForm((f) => ({ ...f, subject: on ? "" : t }))}
                className={`rounded-full border px-3 py-1 text-sm transition-colors ${
                  on ? "border-primary bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {t}
              </button>
            );
          })}
        </div>
      </fieldset>

      <label className="grid gap-1.5 text-sm">
        <span className="font-medium">Message</span>
        <textarea
          required
          rows={5}
          maxLength={5000}
          value={form.message}
          onChange={set("message")}
          placeholder="Tell me a little about the role or project…"
          className={`${inputCls} resize-y`}
        />
      </label>

      <div className="flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={status === "sending"}
          className="inline-flex h-12 items-center gap-2 rounded-full bg-primary px-7 shadow-[0_0_30px_-6px_var(--primary)] text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {status === "sending" ? "Sending…" : "Send message"}
          {status === "sending" ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" aria-hidden />}
        </button>
        {status === "error" && (
          <p className="text-sm text-destructive" role="alert">
            Something went wrong. Please try again or email me directly.
          </p>
        )}
      </div>
    </form>
  );
}
