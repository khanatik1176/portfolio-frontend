"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState, type FormEvent } from "react";
import { Magnetic } from "../fx/Magnetic";
import { Marquee } from "../fx/Marquee";
import { Reveal } from "../fx/Reveal";
import { SectionFrame } from "./SectionFrame";
import type { SectionProps } from "./types";

type Status = "idle" | "sending" | "sent" | "error";

export function Contact({ section, settings, index }: SectionProps) {
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

  const input =
    "w-full rounded-lg border bg-background/60 px-4 py-3 outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-ring/30";

  return (
    <SectionFrame
      section={section}
      index={index}
      surface="mist"
      className="mt-8 pb-28 sm:pb-36"
      decor={
        <div className="absolute inset-x-0 bottom-6 text-foreground opacity-[0.07]">
          <Marquee duration={30}>
            {["Let's talk", "Say hello", "Open to work"].map((t) => (
              <span key={t} className="flex shrink-0 items-center gap-6 pr-6 text-7xl font-black tracking-tighter whitespace-nowrap uppercase sm:text-9xl">
                {t} ✦
              </span>
            ))}
          </Marquee>
        </div>
      }
    >
      <div className="grid gap-12 lg:grid-cols-2">
        <Reveal className="flex flex-col gap-8">
          {settings.email && (
            <Magnetic strength={0.2}>
              <a
                href={`mailto:${settings.email}`}
                className="group relative inline-flex items-center gap-3 overflow-hidden rounded-lg border bg-card/60 px-6 py-4 text-lg font-semibold backdrop-blur sm:text-xl"
              >
                <span className="absolute inset-0 -z-10 origin-left scale-x-0 bg-primary transition-transform duration-500 ease-out group-hover:scale-x-100" />
                <span className="transition-colors duration-500 group-hover:text-primary-foreground">{settings.email}</span>
                <span className="transition-all duration-500 group-hover:rotate-45 group-hover:text-primary-foreground">→</span>
              </a>
            </Magnetic>
          )}
          {settings.location && (
            <p className="flex items-center gap-2 text-muted-foreground">
              <span className="h-2 w-2 rounded-full bg-primary" /> Based in {settings.location}
            </p>
          )}
          <ul className="flex flex-wrap gap-3">
            {settings.socials.map((s) => (
              <li key={s.url}>
                <a
                  href={s.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-block rounded-lg border px-5 py-2 capitalize transition-colors hover:border-primary hover:text-highlight"
                >
                  {s.platform} ↗
                </a>
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={0.15}>
          <form onSubmit={onSubmit} className="grid gap-4 rounded-lg border bg-card/60 p-6 backdrop-blur sm:p-8">
            <div className="grid gap-4 sm:grid-cols-2">
              <input name="name" required maxLength={120} placeholder="Your name" className={input} />
              <input name="email" type="email" required placeholder="Email" className={input} />
            </div>
            <input name="subject" maxLength={200} placeholder="Subject (optional)" className={input} />
            <textarea name="message" required rows={5} maxLength={5000} placeholder="Tell me about your project…" className={input} />
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              disabled={status === "sending"}
              className="rounded-lg bg-primary px-6 py-3.5 font-semibold text-primary-foreground shadow-[0_0_40px_-10px_var(--primary)] disabled:opacity-60"
            >
              {status === "sending" ? "Sending…" : "Send message"}
            </motion.button>
            <AnimatePresence>
              {(status === "sent" || status === "error") && (
                <motion.p
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={status === "sent" ? "text-highlight" : "text-destructive"}
                >
                  {status === "sent" ? "Thanks! I'll get back to you soon." : "Something went wrong. Please try again."}
                </motion.p>
              )}
            </AnimatePresence>
          </form>
        </Reveal>
      </div>
    </SectionFrame>
  );
}
