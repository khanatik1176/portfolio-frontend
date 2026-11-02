"use client";

import {
  AnimatePresence,
  motion,
  useAnimationControls,
  useReducedMotion,
} from "motion/react";
import { useRouter } from "next/navigation";
import { useId, useRef, useState, type FormEvent, type ReactNode } from "react";
import { LogoMark } from "@/components/fx/Logo";
import { api, auth, json } from "@/lib/api";

const EASE = [0.22, 1, 0.36, 1] as const;

// Fixed positions so server and client render the same deck of drifting suits.
const SUITS = [
  {
    glyph: "♠",
    left: "8%",
    top: "18%",
    size: "text-4xl",
    tone: "text-secondary/40",
    duration: 14,
  },
  {
    glyph: "♥",
    left: "84%",
    top: "12%",
    size: "text-5xl",
    tone: "text-chart-5/35",
    duration: 17,
  },
  {
    glyph: "✦",
    left: "16%",
    top: "72%",
    size: "text-3xl",
    tone: "text-primary/50",
    duration: 12,
  },
  {
    glyph: "♦",
    left: "76%",
    top: "70%",
    size: "text-4xl",
    tone: "text-primary/35",
    duration: 15,
  },
  {
    glyph: "♣",
    left: "48%",
    top: "88%",
    size: "text-3xl",
    tone: "text-secondary/35",
    duration: 19,
  },
  {
    glyph: "✦",
    left: "92%",
    top: "44%",
    size: "text-2xl",
    tone: "text-chart-5/40",
    duration: 11,
  },
  {
    glyph: "✦",
    left: "4%",
    top: "46%",
    size: "text-xl",
    tone: "text-primary/40",
    duration: 13,
  },
];

/**
 * Backstage door to the admin: the hero's drifting glows and cursor spotlight
 * behind a card with a spinning purple-gold-pink edge. A wrong
 * password shakes the card; a right one flips it over before heading in.
 */
export default function LoginPage() {
  const router = useRouter();
  const reduce = useReducedMotion();
  const card = useAnimationControls();
  const stageRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");
  const [showPassword, setShowPassword] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setError(null);
    try {
      const { accessToken } = await api<{ accessToken: string }>(
        "/auth/login",
        {
          method: "POST",
          body: json(Object.fromEntries(new FormData(e.currentTarget))),
        },
      );
      auth.setToken(accessToken);
      setStatus("success");
      if (!reduce)
        await card.start({
          rotateY: 180,
          scale: 0.92,
          transition: { duration: 0.7, ease: EASE },
        });
      router.replace("/admin");
    } catch (err) {
      setError((err as Error).message);
      setStatus("idle");
      if (!reduce)
        card.start({
          x: [0, -14, 12, -8, 6, -3, 0],
          transition: { duration: 0.5 },
        });
    }
  }

  return (
    <main
      className="relative flex min-h-screen items-center justify-center overflow-hidden p-4 sm:p-6"
      onPointerMove={(e) => {
        const el = stageRef.current;
        if (!el || e.pointerType !== "mouse") return;
        el.style.setProperty("--mx", `${e.clientX}px`);
        el.style.setProperty("--my", `${e.clientY}px`);
      }}
    >
      {/* Stage background: glows, grid, spotlight and drifting suits */}
      <div
        ref={stageRef}
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <motion.div
          className="absolute -top-40 -left-40 h-[36rem] w-[36rem] rounded-full bg-secondary/40 blur-[130px]"
          animate={
            reduce
              ? undefined
              : { x: [0, 120, 0], y: [0, 80, 0], scale: [1, 1.15, 1] }
          }
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -right-40 -bottom-20 h-[32rem] w-[32rem] rounded-full bg-primary/20 blur-[130px]"
          animate={
            reduce
              ? undefined
              : { x: [0, -100, 0], y: [0, -60, 0], scale: [1.1, 0.95, 1.1] }
          }
          transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-1/3 left-1/2 h-[22rem] w-[22rem] -translate-x-1/2 rounded-full bg-chart-5/15 blur-[120px]"
          animate={
            reduce
              ? undefined
              : { scale: [0.9, 1.2, 0.9], opacity: [0.6, 1, 0.6] }
          }
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="bg-grid absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_70%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(500px_circle_at_var(--mx,50%)_var(--my,40%),color-mix(in_oklch,var(--primary)_10%,transparent),transparent_60%)]" />
        {SUITS.map((s, i) => (
          <motion.span
            key={i}
            className={`absolute font-display ${s.size} ${s.tone}`}
            style={{ left: s.left, top: s.top }}
            initial={{ opacity: 0, scale: 0 }}
            animate={
              reduce
                ? { opacity: 1, scale: 1 }
                : {
                    opacity: 1,
                    scale: 1,
                    y: [0, -24, 0],
                    rotate: [0, 18, -12, 0],
                  }
            }
            transition={{
              opacity: { delay: 0.3 + i * 0.08, duration: 0.6 },
              scale: {
                delay: 0.3 + i * 0.08,
                type: "spring",
                stiffness: 260,
                damping: 14,
              },
              y: { duration: s.duration, repeat: Infinity, ease: "easeInOut" },
              rotate: {
                duration: s.duration * 1.3,
                repeat: Infinity,
                ease: "easeInOut",
              },
            }}
          >
            {s.glyph}
          </motion.span>
        ))}
      </div>

      <motion.div
        className="relative w-full max-w-md [perspective:1200px]"
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: EASE }}
      >
        {/* The card stays still while you type; it only moves to shake or flip. */}
        <motion.div
          animate={card}
          className="rounded-[1.75rem] shadow-[0_30px_80px_-20px_oklch(0.52_0.24_305/0.7)]"
        >
          {/* Spinning gradient edge, clipped to a 2px ring by the inner card */}
          <div className="relative overflow-hidden rounded-[1.75rem] p-[2px]">
            <motion.div
              aria-hidden
              className="absolute -inset-[60%] bg-[conic-gradient(from_0deg,var(--secondary),var(--primary),var(--chart-5),var(--secondary))]"
              animate={reduce ? undefined : { rotate: 360 }}
              transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
            />
            <div className="relative rounded-[calc(1.75rem-2px)] bg-[linear-gradient(160deg,oklch(0.24_0.08_305),oklch(0.15_0.04_300))] p-6 sm:p-8">
              <div className="mb-8 flex flex-col items-center text-center">
                <motion.div
                  initial={{ scale: 0, rotate: -90 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{
                    delay: 0.1,
                    type: "spring",
                    stiffness: 220,
                    damping: 12,
                  }}
                >
                  <LogoMark className="h-16 w-16 drop-shadow-[0_8px_24px_var(--secondary)]" />
                </motion.div>
                <motion.p
                  className="mt-4 font-serif text-lg text-muted-foreground italic"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15, duration: 0.4 }}
                >
                  Welcome back
                </motion.p>
                <motion.h1
                  className="text-joker font-display text-3xl font-extrabold tracking-tight sm:text-4xl"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.5, ease: EASE }}
                >
                  Backstage pass
                </motion.h1>
              </div>

              <form onSubmit={onSubmit} className="grid gap-4">
                <Reveal delay={0.2}>
                  <GlowField label="Email" icon="@">
                    <input
                      name="email"
                      type="email"
                      required
                      autoFocus
                      autoComplete="username"
                      placeholder="you@example.com"
                      className={inputClass}
                    />
                  </GlowField>
                </Reveal>
                <Reveal delay={0.28}>
                  <GlowField
                    label="Password"
                    icon="✦"
                    trailing={
                      <motion.button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="mr-1.5 grid size-9 shrink-0 place-items-center rounded-lg transition-colors hover:bg-secondary/20"
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
                        aria-pressed={showPassword}
                        title={showPassword ? "Hide password" : "Show password"}
                      >
                        <PasswordEye open={showPassword} />
                      </motion.button>
                    }
                  >
                    <input
                      name="password"
                      type={showPassword ? "text" : "password"}
                      required
                      autoComplete="current-password"
                      placeholder="••••••••"
                      className={inputClass}
                    />
                  </GlowField>
                </Reveal>

                <AnimatePresence>
                  {error && (
                    <motion.p
                      role="alert"
                      className="rounded-xl border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
                      initial={{ opacity: 0, height: 0, y: -6 }}
                      animate={{ opacity: 1, height: "auto", y: 0 }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      {error}
                    </motion.p>
                  )}
                </AnimatePresence>

                <Reveal delay={0.36}>
                  <motion.button
                    disabled={status !== "idle"}
                    whileHover={status === "idle" ? { scale: 1.02 } : undefined}
                    whileTap={status === "idle" ? { scale: 0.97 } : undefined}
                    className="group relative mt-2 w-full overflow-hidden rounded-xl bg-primary px-4 py-3 font-display text-sm font-bold tracking-wide text-primary-foreground shadow-[0_10px_30px_-10px_var(--primary)] disabled:opacity-80"
                  >
                    {/* Light sweep across the button */}
                    <span
                      aria-hidden
                      className="absolute inset-y-0 -left-1/2 w-1/2 -skew-x-12 bg-white/35 blur-sm motion-safe:animate-[sweep_2.8s_ease-in-out_infinite]"
                    />
                    <span className="relative flex items-center justify-center gap-2">
                      {status === "loading" && (
                        <motion.span
                          animate={{ rotate: 360 }}
                          transition={{
                            duration: 0.9,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                        >
                          ✦
                        </motion.span>
                      )}
                      {status === "idle" && "Sign in"}
                      {status === "loading" && "Shuffling the deck…"}
                      {status === "success" && "You're in ✦"}
                    </span>
                  </motion.button>
                </Reveal>
              </form>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </main>
  );
}

// Autofill would otherwise paint the field in the browser's light yellow.
const inputClass =
  "min-w-0 flex-1 bg-transparent py-3.5 pr-3 text-base text-foreground outline-none placeholder:text-muted-foreground/50 sm:text-sm [&:-webkit-autofill]:shadow-[inset_0_0_0_100px_oklch(0.17_0.04_300)] [&:-webkit-autofill]:[-webkit-text-fill-color:var(--foreground)]";

function Reveal({ delay, children }: { delay: number; children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

/** Labelled input whose frame lights up purple-to-gold while focused. */
function GlowField({
  label,
  icon,
  trailing,
  children,
}: {
  label: string;
  icon: string;
  trailing?: ReactNode;
  children: ReactNode;
}) {
  return (
    <label className="grid gap-1.5 text-sm">
      <span className="font-medium text-muted-foreground">{label}</span>
      <span className="group/field relative flex items-center rounded-xl border border-border bg-background/60 transition-[border-color,box-shadow] duration-300 focus-within:border-primary/70 focus-within:shadow-[0_0_0_4px_color-mix(in_oklch,var(--primary)_18%,transparent),0_0_24px_-6px_var(--secondary)]">
        <span
          aria-hidden
          className="w-10 shrink-0 text-center text-muted-foreground transition-colors group-focus-within/field:text-primary"
        >
          {icon}
        </span>
        {children}
        {trailing}
      </span>
    </label>
  );
}

/**
 * Show/hide toggle drawn in the theme: a purple-to-gold eye whose iris opens
 * when the password is visible, and a slash strikes through when it's hidden.
 */
function PasswordEye({ open }: { open: boolean }) {
  const id = useId();
  const spring = { type: "spring", stiffness: 420, damping: 26 } as const;
  return (
    <svg viewBox="0 0 24 24" className="size-5" fill="none" aria-hidden>
      <defs>
        <linearGradient
          id={`${id}g`}
          x1="2"
          y1="12"
          x2="22"
          y2="12"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="var(--chart-2)" />
          <stop offset="1" stopColor="var(--primary)" />
        </linearGradient>
      </defs>
      {/* Lids */}
      <path
        d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z"
        stroke={`url(#${id}g)`}
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      {/* Iris and pupil squeeze shut when hidden */}
      <motion.g
        style={{ transformOrigin: "12px 12px", transformBox: "view-box" }}
        initial={false}
        animate={{ scaleY: open ? 1 : 0.1, opacity: open ? 1 : 0.5 }}
        transition={spring}
      >
        <circle cx="12" cy="12" r="3.4" fill={`url(#${id}g)`} />
        <circle cx="12" cy="12" r="1.3" fill="var(--background)" />
        <circle
          cx="13.3"
          cy="10.7"
          r="0.7"
          fill="var(--foreground)"
          opacity="0.85"
        />
      </motion.g>
      {/* Strike-through when hidden */}
      <motion.path
        d="M4 4L20 20"
        stroke="var(--primary)"
        strokeWidth="1.8"
        strokeLinecap="round"
        initial={false}
        animate={{ pathLength: open ? 0 : 1, opacity: open ? 0 : 1 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
      />
    </svg>
  );
}
