"use client";

import { animate, motion, useMotionTemplate, useMotionValue, useReducedMotion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";

const SOURCE = `// cyberdeck :: skills.config.ts
import { defineLoadout, deck } from "@kaf/cyberdeck";

export const loadout = defineLoadout({
  operator: "Khan Atik Faisal",
  role: "Software Engineer",
  uplink: "ACI PLC",
  frontend: ["react", "next.js", "redux", "tailwind"],
  backend: ["nestjs", "django", "asp.net", "rest"],
  languages: ["typescript", "python", "c#"],
  databases: ["postgresql", "mysql", "mssql", "oracle"],
  status: "OPEN_TO_WORK",
});

async function boot(): Promise<Status> {
  await deck.connect({ host: "kaf.dev", port: 2222 });
  for (const mod of loadout.modules) {
    await deck.install(mod); // 36 modules
  }
  deck.overclock({ coffee: Infinity });
  return deck.status(); // ONLINE
}

boot().then(() => console.log("[OK] neural link stable"));`;

const KEYWORDS = /^(import|from|export|const|async|function|await|for|of|return|new|Promise|Infinity)$/;
type Token = { text: string; cls: string; start: number };

/** Minimal syntax highlighter: comments, strings, numbers, keywords, punctuation. */
function tokenize(line: string): Token[] {
  const out: Token[] = [];
  const re = /(\/\/.*$)|("[^"]*")|(\b\d+\b)|([A-Za-z_$][\w$]*)|(\s+)|(.)/g;
  for (const m of line.matchAll(re)) {
    const [text, comment, str, num, word] = m;
    const cls = comment
      ? "text-muted-foreground italic"
      : str
        ? "text-primary"
        : num
          ? "text-chart-2"
          : word && KEYWORDS.test(word)
            ? "text-chart-3 font-semibold"
            : word
              ? "text-foreground"
              : "text-muted-foreground";
    out.push({ text, cls, start: m.index ?? 0 });
  }
  return out;
}

const LINES = SOURCE.split("\n");
// Character offset where each line starts within SOURCE (+1 per newline).
const LINE_START = LINES.reduce<number[]>((acc, line, i) => [...acc, i === 0 ? 0 : acc[i - 1] + LINES[i - 1].length + 1], []);
const TOTAL = SOURCE.length;
const CHARS_PER_TICK = 3;
const TICK_MS = 35;
const HOLD_MS = 3500;

/** Renders the first `chars` characters of the source with highlighting, caret and line numbers. */
function Code({ chars, tokens, showCaret }: { chars: number; tokens: Token[][]; showCaret: boolean }) {
  const activeLine = Math.max(0, LINE_START.findLastIndex((start) => start <= chars));

  return (
    <pre className="font-mono text-[13px] leading-7 sm:text-sm">
      {tokens.map((line, li) => {
        const budget = chars - LINE_START[li];
        if (budget < 0) return null;
        return (
          <div key={li} className={`relative flex ${li === activeLine ? "bg-primary/[0.07]" : ""}`}>
            <span className="w-10 shrink-0 pr-4 text-right text-muted-foreground/60 select-none">{li + 1}</span>
            <span className="whitespace-pre">
              {line.map((t, ti) =>
                t.start < budget ? (
                  <span key={ti} className={t.cls}>
                    {t.text.slice(0, budget - t.start)}
                  </span>
                ) : null,
              )}
              {showCaret && li === activeLine && <span className="ml-px inline-block h-4 w-2 translate-y-0.5 animate-pulse bg-primary" />}
            </span>
          </div>
        );
      })}
    </pre>
  );
}

/**
 * Ghost IDE: a code file types itself (with syntax highlighting, caret and
 * active-line bar), loops with a glitch-clear, and is nearly invisible except
 * inside a flashlight that follows the cursor (or drifts on its own when idle).
 */
export function HackerFeed({ className }: { className?: string }) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const tokens = useMemo(() => LINES.map(tokenize), []);
  const [chars, setChars] = useState(reduce ? TOTAL : 0);
  const [glitch, setGlitch] = useState(false);

  // Typing loop: type everything, hold, glitch-clear, repeat.
  useEffect(() => {
    if (reduce) return;
    let n = 0;
    let timer: ReturnType<typeof setTimeout>;
    const tick = () => {
      n = Math.min(TOTAL, n + CHARS_PER_TICK);
      setChars(n);
      if (n < TOTAL) {
        timer = setTimeout(tick, TICK_MS);
      } else {
        timer = setTimeout(() => {
          setGlitch(true);
          timer = setTimeout(() => {
            setGlitch(false);
            n = 0;
            setChars(0);
            timer = setTimeout(tick, 600);
          }, 450);
        }, HOLD_MS);
      }
    };
    timer = setTimeout(tick, 800);
    return () => clearTimeout(timer);
  }, [reduce]);

  // Flashlight: follows the pointer over the area, otherwise drifts in a slow loop.
  const mx = useMotionValue(30);
  const my = useMotionValue(35);
  useEffect(() => {
    if (reduce) return;
    let idle: ReturnType<typeof setTimeout> | undefined;
    let drift = [
      animate(mx, [30, 70, 55, 25, 30], { duration: 18, repeat: Infinity, ease: "easeInOut" }),
      animate(my, [35, 25, 65, 70, 35], { duration: 18, repeat: Infinity, ease: "easeInOut" }),
    ];
    const onMove = (e: PointerEvent) => {
      const r = ref.current?.getBoundingClientRect();
      if (!r || e.clientY < r.top || e.clientY > r.bottom) return;
      drift.forEach((a) => a.stop());
      mx.set(((e.clientX - r.left) / r.width) * 100);
      my.set(((e.clientY - r.top) / r.height) * 100);
      clearTimeout(idle);
      idle = setTimeout(() => {
        drift = [
          animate(mx, [mx.get(), 70, 25, mx.get()], { duration: 18, repeat: Infinity, ease: "easeInOut" }),
          animate(my, [my.get(), 25, 70, my.get()], { duration: 18, repeat: Infinity, ease: "easeInOut" }),
        ];
      }, 2500);
    };
    window.addEventListener("pointermove", onMove);
    return () => {
      window.removeEventListener("pointermove", onMove);
      drift.forEach((a) => a.stop());
      clearTimeout(idle);
    };
  }, [mx, my, reduce]);

  const mask = useMotionTemplate`radial-gradient(circle 260px at ${mx}% ${my}%, black 0%, rgb(0 0 0 / 0.6) 45%, transparent 100%)`;
  const glow = useMotionTemplate`radial-gradient(circle 260px at ${mx}% ${my}%, color-mix(in oklch, var(--primary) 9%, transparent), transparent 70%)`;

  const code = <Code chars={chars} tokens={tokens} showCaret={!reduce} />;

  return (
    <div ref={ref} aria-hidden className={`pointer-events-none overflow-hidden ${className ?? ""}`}>
      <motion.div
        className="absolute inset-0 px-6 pt-28 sm:px-12"
        animate={glitch ? { x: [0, -6, 4, -2, 0], opacity: [1, 0.3, 0.8, 0.2, 0], skewX: [0, -6, 4, 0, 0] } : { x: 0, opacity: 1, skewX: 0 }}
        transition={{ duration: glitch ? 0.45 : 0.2 }}
      >
        {/* Ghost layer: barely visible everywhere */}
        <div className="absolute inset-0 px-6 pt-28 opacity-[0.07] sm:px-12">{code}</div>
        {/* Revealed layer: full color inside the flashlight */}
        <motion.div className="absolute inset-0 px-6 pt-28 sm:px-12" style={{ maskImage: mask, WebkitMaskImage: mask }}>
          {code}
        </motion.div>
      </motion.div>
      {/* Flashlight glow */}
      <motion.div className="absolute inset-0" style={{ background: glow }} />
    </div>
  );
}
