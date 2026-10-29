"use client";

import { MapPin } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { Reveal } from "../fx/Reveal";
import { SocialIcon } from "../fx/SocialIcon";
import { SectionFrame } from "./SectionFrame";
import type { SectionProps } from "./types";

type Status = "idle" | "sending" | "sent" | "error";

const LOG_STEPS = ["encrypting payload…", "routing via node_07…", "handshake verified…"];
const MIN_SEND_MS = 1600; // let the transmission play even on a fast response

/** "https://github.com/khanatik1176" → "@khanatik1176". */
const handleOf = (url: string) => {
  try {
    const last = new URL(url).pathname.split("/").filter(Boolean).pop();
    return last ? `@${last}` : new URL(url).host;
  } catch {
    return url;
  }
};

/** Contact as a signal constellation (channels orbiting your core) plus a typing-reactive transmitter. */
export function Contact({ section, settings, index }: SectionProps) {
  const initials = (settings.ownerName || settings.siteName)
    .split(" ")
    .map((w) => w[0])
    .join("");

  return (
    <SectionFrame
      section={section}
      index={index}
      surface="mist"
      className="mt-8"
      decor={<div className="bg-grid absolute inset-0 opacity-50 [mask-image:radial-gradient(ellipse_at_30%_50%,black_15%,transparent_70%)]" />}
    >
      <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <Reveal>
          <Constellation core={initials} email={settings.email} socials={settings.socials} location={settings.location} />
        </Reveal>
        <Reveal delay={0.15}>
          <Transmitter />
        </Reveal>
      </div>
    </SectionFrame>
  );
}

/* ---------------- Left: signal constellation ---------------- */

function Constellation({
  core,
  email,
  socials,
  location,
}: {
  core: string;
  email: string | null;
  socials: { platform: string; url: string }[];
  location: string | null;
}) {
  const reduce = useReducedMotion();
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

  const nodes = [
    ...(email ? [{ platform: "email", href: `mailto:${email}`, label: email, color: "var(--primary)" }] : []),
    ...socials.map((s, i) => ({
      platform: s.platform,
      href: s.url,
      label: handleOf(s.url),
      color: i % 2 ? "var(--chart-3)" : "var(--chart-2)",
    })),
  ];

  const copy = async () => {
    if (!email) return;
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard unavailable: the email node still opens the mail app */
    }
  };

  return (
    <div>
      <p className="mb-6 font-mono text-[10px] tracking-[0.3em] text-muted-foreground uppercase">▸ signal constellation · hover to hold orbit</p>

      <div className="cp-orbit-host relative mx-auto aspect-square w-full max-w-[400px]">
        {/* Rings */}
        <svg viewBox="0 0 200 200" className="absolute inset-0 h-full w-full" aria-hidden>
          <circle cx="100" cy="100" r="88" fill="none" stroke="var(--border)" strokeDasharray="2 4" />
          <circle cx="100" cy="100" r="58" fill="none" stroke="var(--border)" strokeDasharray="1 3" />
          <circle cx="100" cy="100" r="88" fill="none" stroke="var(--chart-2)" strokeOpacity="0.5" strokeWidth="1" strokeDasharray="30 523" className="cp-orbit" style={{ transformOrigin: "100px 100px" }} />
        </svg>

        {/* Orbiting satellites with beams to the core */}
        <div className="cp-orbit absolute inset-0">
          <svg viewBox="0 0 200 200" className="absolute inset-0 h-full w-full overflow-visible" aria-hidden>
            {nodes.map((n, i) => {
              const a = (i / nodes.length) * Math.PI * 2 - Math.PI / 2;
              return (
                <motion.line
                  key={n.href}
                  x1="100"
                  y1="100"
                  x2={(100 + 88 * Math.cos(a)).toFixed(2)}
                  y2={(100 + 88 * Math.sin(a)).toFixed(2)}
                  stroke={n.color}
                  strokeOpacity="0.55"
                  strokeWidth="1"
                  strokeDasharray="3 5"
                  animate={reduce ? undefined : { strokeDashoffset: [0, -16] }}
                  transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
                />
              );
            })}
          </svg>

          {nodes.map((n, i) => {
            const a = (i / nodes.length) * Math.PI * 2 - Math.PI / 2;
            return (
              <div
                key={n.href}
                className="absolute -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${(50 + 44 * Math.cos(a)).toFixed(3)}%`, top: `${(50 + 44 * Math.sin(a)).toFixed(3)}%` }}
              >
                <div className="cp-orbit-counter">
                  <a
                    href={n.href}
                    target={n.platform === "email" ? undefined : "_blank"}
                    rel="noreferrer"
                    aria-label={n.label}
                    className="group/node relative grid h-14 w-14 place-items-center rounded-full border-2 bg-card text-foreground transition-transform hover:scale-110"
                    style={{ borderColor: n.color, boxShadow: `0 0 22px -6px ${n.color}` }}
                  >
                    <SocialIcon platform={n.platform} className="h-5 w-5" />
                    <span
                      className="pointer-events-none absolute top-full mt-2 rounded-md border bg-card px-2 py-1 font-mono text-[10px] whitespace-nowrap opacity-0 shadow-lg transition-opacity group-hover/node:opacity-100"
                      style={{ borderColor: n.color, color: n.color }}
                    >
                      {n.label}
                    </span>
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        {/* Core */}
        <div className="absolute top-1/2 left-1/2 grid h-24 w-24 -translate-x-1/2 -translate-y-1/2 place-items-center">
          {!reduce && (
            <motion.span
              aria-hidden
              className="absolute inset-0 rounded-full border-2 border-primary"
              animate={{ scale: [1, 1.8], opacity: [0.6, 0] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: "easeOut" }}
            />
          )}
          <span className="grid h-full w-full place-items-center rounded-full border-2 border-primary bg-background shadow-[0_0_40px_-8px_var(--primary)]">
            <span className="text-center">
              <span className="block text-2xl font-black tracking-tight text-highlight">{core}</span>
              <span className="font-mono text-[8px] tracking-[0.3em] text-muted-foreground uppercase">online</span>
            </span>
          </span>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3 font-mono text-[11px]">
        {location && (
          <span className="flex items-center gap-1.5 rounded-md border bg-card/70 px-3 py-1.5 text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 text-chart-2" aria-hidden /> {location}
          </span>
        )}
        {email && (
          <button
            type="button"
            onClick={copy}
            className="rounded-md border bg-card/70 px-3 py-1.5 font-bold tracking-widest uppercase transition-colors hover:border-primary hover:text-highlight"
          >
            {copied ? <span className="text-chart-3">email copied ✓</span> : "copy email"}
          </button>
        )}
      </div>
    </div>
  );
}

/* ---------------- Right: typing-reactive transmitter ---------------- */

/** Signal energy: each keystroke adds some, and the oscilloscope decays it every frame. */
function useEnergy() {
  const energy = useRef(0);
  const pulse = () => {
    energy.current = Math.min(1, energy.current + 0.3);
  };
  return { energy, pulse };
}

const SCOPE_W = 400;
const SCOPE_H = 64;
const LAYERS = [
  { color: "var(--chart-2)", amp: 1, freq: 1, speed: 2.2, phase: 0 },
  { color: "var(--chart-3)", amp: 0.7, freq: 1.6, speed: -1.6, phase: 1.3 },
  { color: "var(--primary)", amp: 0.45, freq: 2.4, speed: 3.1, phase: 2.6 },
];
const FLAT = `M0 ${SCOPE_H / 2} L${SCOPE_W} ${SCOPE_H / 2}`;

/**
 * Neon oscilloscope: three sine traces pinned at both ends ripple across a
 * scope grid. Keystrokes add energy (taller, tighter waves) that decays back
 * to an idle ripple; transmitting surges the signal. Drawn per frame via refs.
 */
function Oscilloscope({ energy, sending }: { energy: React.MutableRefObject<number>; sending: boolean }) {
  const reduce = useReducedMotion();
  const paths = useRef<(SVGPathElement | null)[]>([]);
  const dot = useRef<SVGCircleElement>(null);
  const readout = useRef<HTMLSpanElement>(null);
  const sendingRef = useRef(sending);
  useEffect(() => {
    sendingRef.current = sending;
  }, [sending]);

  useEffect(() => {
    if (reduce) return;
    let raf = 0;
    const start = performance.now();
    const frame = (now: number) => {
      const t = (now - start) / 1000;
      energy.current *= 0.965;
      const surge = sendingRef.current ? 1 : 0;
      const amp = 5 + energy.current * 20 + surge * 16;
      const freq = 1.6 + energy.current * 2.4 + surge * 3.5;

      const yAt = (layer: (typeof LAYERS)[number], x: number) => {
        const nx = x / SCOPE_W;
        const envelope = Math.sin(Math.PI * nx);
        return SCOPE_H / 2 + envelope * amp * layer.amp * Math.sin(nx * freq * layer.freq * Math.PI * 2 + t * layer.speed + layer.phase);
      };

      LAYERS.forEach((layer, i) => {
        let d = "";
        for (let x = 0; x <= SCOPE_W; x += 4) d += `${x ? "L" : "M"}${x} ${yAt(layer, x).toFixed(2)} `;
        paths.current[i]?.setAttribute("d", d);
      });

      const sx = (t * 90) % SCOPE_W;
      dot.current?.setAttribute("cx", sx.toFixed(1));
      dot.current?.setAttribute("cy", yAt(LAYERS[0], sx).toFixed(2));
      if (readout.current) {
        readout.current.textContent = `amp ${String(Math.round((amp / 41) * 100)).padStart(3, "0")}% · freq ${(freq * 1.2).toFixed(1)} ghz`;
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [energy, reduce]);

  return (
    <div className="relative h-16 overflow-hidden rounded-md border bg-background/60">
      {/* Scope grid */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "linear-gradient(to right, var(--border) 1px, transparent 1px), linear-gradient(to bottom, var(--border) 1px, transparent 1px)",
          backgroundSize: "25px 16px",
        }}
      />
      <span aria-hidden className="absolute inset-x-0 top-1/2 h-px bg-border" />
      <svg aria-hidden viewBox={`0 0 ${SCOPE_W} ${SCOPE_H}`} preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
        {LAYERS.map((layer, i) => (
          <path
            key={i}
            ref={(el) => {
              paths.current[i] = el;
            }}
            d={FLAT}
            fill="none"
            stroke={layer.color}
            strokeWidth={i === 0 ? 2 : 1.4}
            strokeOpacity={i === 0 ? 1 : 0.8}
            vectorEffect="non-scaling-stroke"
            style={{ filter: `drop-shadow(0 0 4px ${layer.color})` }}
          />
        ))}
        <circle ref={dot} cx="0" cy={SCOPE_H / 2} r="3" fill="white" style={{ filter: "drop-shadow(0 0 6px var(--chart-2))" }} />
      </svg>
      <span ref={readout} aria-hidden className="absolute right-2 bottom-1 font-mono text-[9px] tracking-widest text-muted-foreground uppercase">
        amp 012% · freq 1.9 ghz
      </span>
    </div>
  );
}

type Field = "name" | "email" | "subject" | "message";
type Answers = Record<Field, string>;

const SUBJECT_CHIPS = ["Job opportunity", "Freelance project", "Collaboration", "Just saying hi"];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const STEPS: { key: Field; prompt: (a: Answers) => string; placeholder: string }[] = [
  { key: "name", prompt: () => "Hey! I'm the uplink bot. What should I call you?", placeholder: "your name" },
  { key: "email", prompt: (a) => `Nice to meet you, ${a.name.split(" ")[0]}. Where can I reply?`, placeholder: "you@domain.com" },
  { key: "subject", prompt: () => "What's this about? Pick one or type your own.", placeholder: "subject" },
  { key: "message", prompt: () => "Go ahead, tell me about it.", placeholder: "your message… (Shift+Enter for a new line)" },
];

/** Bot line that types itself in. */
function BotLine({ text }: { text: string }) {
  const reduce = useReducedMotion();
  const [n, setN] = useState(reduce ? text.length : 0);
  useEffect(() => {
    if (reduce) return;
    const id = setInterval(() => setN((c) => (c >= text.length ? (clearInterval(id), c) : c + 2)), 18);
    return () => clearInterval(id);
  }, [text, reduce]);
  return (
    <motion.p initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="flex gap-2 font-mono text-[13px]">
      <span className="shrink-0 text-chart-2">uplink ›</span>
      <span>
        {text.slice(0, n)}
        {n < text.length && <span className="ml-0.5 inline-block h-3.5 w-1.5 translate-y-0.5 animate-pulse bg-chart-2" />}
      </span>
    </motion.p>
  );
}

/**
 * Conversational transmitter: an uplink bot asks one question at a time, the
 * visitor answers in chat bubbles, reviews the packet, and transmits it.
 * A live waveform at the top reacts to every keystroke.
 */
function Transmitter() {
  const [answers, setAnswers] = useState<Answers>({ name: "", email: "", subject: "", message: "" });
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [log, setLog] = useState<string[]>([]);
  const [launch, setLaunch] = useState(0);
  const { energy, pulse } = useEnergy();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const reviewing = step >= STEPS.length;
  const current = STEPS[Math.min(step, STEPS.length - 1)];

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [step, status, log.length]);

  const answer = (value: string) => {
    const v = value.trim();
    if (!v) return setError("This one can't be empty.");
    if (current.key === "email" && !EMAIL_RE.test(v)) return setError("That doesn't look like an email address.");
    if (current.key === "name" && v.length > 120) return setError("Please keep the name under 120 characters.");
    setError(null);
    setAnswers((a) => ({ ...a, [current.key]: v }));
    setDraft("");
    setStep((s) => s + 1);
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  const restart = () => {
    setAnswers({ name: "", email: "", subject: "", message: "" });
    setStep(0);
    setDraft("");
    setError(null);
    setStatus("idle");
    setLog([]);
  };

  async function transmit() {
    setStatus("sending");
    setLog([]);
    setLaunch((n) => n + 1);
    LOG_STEPS.forEach((line, i) => setTimeout(() => setLog((l) => [...l, line]), i * 450));

    const [res] = await Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(answers),
      }).catch(() => null),
      new Promise((r) => setTimeout(r, MIN_SEND_MS)),
    ]);
    setStatus(res?.ok ? "sent" : "error");
  }

  return (
    <div
      onKeyDown={pulse}
      className="relative flex h-[34rem] flex-col overflow-hidden rounded-xl border border-primary/30 bg-card/80 shadow-[0_0_50px_-20px_var(--primary)] backdrop-blur"
    >
      {/* Live signal waveform */}
      <div className="relative shrink-0 border-b bg-background/50 px-4 pt-3 pb-2">
        <div className="mb-2 flex items-center justify-between font-mono text-[10px] tracking-[0.2em] uppercase">
          <span className="text-muted-foreground">
            <span className="text-chart-3">uplink_chat</span> · {reviewing ? "review packet" : `step ${step + 1}/${STEPS.length}`}
          </span>
          <span className="flex items-center gap-3">
            {step > 0 && status !== "sending" && (
              <button type="button" onClick={restart} className="tracking-[0.2em] text-muted-foreground uppercase hover:text-highlight">
                ↺ restart
              </button>
            )}
            <span className="flex items-center gap-2">
              <span className={`h-2 w-2 rounded-full ${status === "sending" ? "animate-pulse bg-primary" : "bg-chart-3"}`} />
              {status === "sending" ? "transmitting" : "channel open"}
            </span>
          </span>
        </div>
        <Oscilloscope energy={energy} sending={status === "sending"} />
        <AnimatePresence>
          {status === "sending" && (
            <motion.span
              key={launch}
              aria-hidden
              className="absolute bottom-0 left-1/2 h-3 w-3 rounded-full bg-primary"
              style={{ boxShadow: "0 0 16px 4px var(--primary)" }}
              initial={{ y: 0, x: 0, opacity: 1, scale: 1 }}
              animate={{ y: -120, x: 160, opacity: 0, scale: 0.4 }}
              transition={{ duration: 1.1, ease: "easeIn" }}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Conversation */}
      <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-5 py-5" aria-live="polite">
        {STEPS.slice(0, Math.min(step + 1, STEPS.length)).map((s, i) => (
          <div key={s.key} className="space-y-3">
            <BotLine text={s.prompt(answers)} />
            {i < step && (
              <motion.p
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                className="ml-auto w-fit max-w-[85%] rounded-lg rounded-br-none border border-primary/40 bg-primary/10 px-3 py-2 text-sm whitespace-pre-wrap"
              >
                {answers[s.key]}
              </motion.p>
            )}
          </div>
        ))}

        {reviewing && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
            <BotLine text="Packet assembled. Review and transmit:" />
            <div className="rounded-lg border border-dashed bg-background/50 p-4 font-mono text-[12px]">
              {(["name", "email", "subject"] as const).map((k) => (
                <p key={k}>
                  <span className="text-chart-2">{k.padEnd(8)}</span> {answers[k]}
                </p>
              ))}
              <p className="mt-2 line-clamp-4 whitespace-pre-wrap text-muted-foreground">{answers.message}</p>
            </div>
          </motion.div>
        )}

        {log.length > 0 && (
          <div className="font-mono text-[11px]">
            {log.map((line) => (
              <p key={line} className="text-muted-foreground">
                <span className="text-chart-2">›</span> {line}
              </p>
            ))}
            {status === "sent" && <p className="font-bold text-chart-3">› delivered ✓ Thanks, {answers.name.split(" ")[0]}! I&apos;ll reply to {answers.email} soon.</p>}
            {status === "error" && <p className="font-bold text-destructive">› transmission failed ✗ please try again.</p>}
          </div>
        )}
      </div>

      {/* Composer */}
      <div className="shrink-0 border-t bg-background/40 p-4">
        {!reviewing ? (
          <>
            {current.key === "subject" && (
              <div className="mb-3 flex flex-wrap gap-2">
                {SUBJECT_CHIPS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => answer(c)}
                    className="rounded-full border px-3 py-1 font-mono text-[11px] transition-colors hover:border-primary hover:text-highlight"
                  >
                    {c}
                  </button>
                ))}
              </div>
            )}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                answer(draft);
              }}
              className="flex items-end gap-3"
            >
              <span className="pb-2 font-mono text-sm text-highlight">❯</span>
              <textarea
                ref={inputRef}
                value={draft}
                onChange={(e) => {
                  setDraft(e.target.value);
                  setError(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !(current.key === "message" && e.shiftKey)) {
                    e.preventDefault();
                    answer(draft);
                  }
                }}
                rows={current.key === "message" ? 3 : 1}
                maxLength={current.key === "message" ? 5000 : 200}
                placeholder={current.placeholder}
                aria-label={current.prompt(answers)}
                className="flex-1 resize-none border-b bg-transparent py-2 font-mono text-sm outline-none placeholder:text-muted-foreground/60 focus:border-primary"
              />
              <button type="submit" className="rounded-lg border border-primary/60 px-3 py-2 font-mono text-[11px] font-bold tracking-widest text-highlight uppercase hover:bg-primary hover:text-primary-foreground">
                enter ↵
              </button>
            </form>
            {error && <p className="mt-2 font-mono text-[11px] text-destructive">› {error}</p>}
          </>
        ) : (
          <motion.button
            type="button"
            onClick={status === "sent" ? restart : transmit}
            disabled={status === "sending"}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            className="relative w-full overflow-hidden rounded-lg bg-primary px-6 py-3.5 font-mono text-sm font-black tracking-[0.25em] text-primary-foreground uppercase shadow-[0_0_40px_-10px_var(--primary)] disabled:opacity-70"
          >
            {status === "sending" && (
              <motion.span
                aria-hidden
                className="absolute inset-y-0 left-0 bg-background/25"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: MIN_SEND_MS / 1000, ease: "easeInOut" }}
              />
            )}
            <span className="relative">
              {status === "sending" ? "transmitting…" : status === "sent" ? "send another ↺" : status === "error" ? "retry transmit ▸" : "transmit ▸"}
            </span>
          </motion.button>
        )}
      </div>
    </div>
  );
}
