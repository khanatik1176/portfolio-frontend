"use client";

import { motion, useMotionTemplate, useMotionValue, useReducedMotion, useSpring, useTransform } from "motion/react";
import { useState } from "react";
import { TechIcon } from "./TechIcon";

function Corner({ flip = false }: { flip?: boolean }) {
  return (
    <span className={`absolute flex flex-col items-center leading-none ${flip ? "right-4 bottom-4 rotate-180" : "top-4 left-4"}`}>
      <span className="font-display text-3xl font-extrabold text-primary">J</span>
      <span className="mt-1 text-sm text-chart-2">✦</span>
    </span>
  );
}

/** Patterned card back used for the fanned deck behind the face card. */
function CardBack({ tone }: { tone: "purple" | "green" }) {
  const c = tone === "purple" ? "var(--secondary)" : "var(--primary)";
  return (
    <div
      className="absolute inset-0 rounded-[1.75rem] border-2 border-white/10 p-3 shadow-xl"
      style={{ background: `repeating-linear-gradient(45deg, color-mix(in oklch, ${c} 85%, black) 0 10px, color-mix(in oklch, ${c} 65%, black) 10px 20px)` }}
    >
      <div className="grid h-full place-items-center rounded-[1.25rem] border-2 border-white/20">
        <span className="font-display text-5xl font-extrabold text-white/70">✦</span>
      </div>
    </div>
  );
}

/**
 * The hero's centerpiece: a Joker playing card with the portrait that tilts
 * toward the cursor with a moving holographic sheen, a fanned deck behind it
 * and tech chips floating around.
 */
export function JokerCard({ name, role, avatarUrl, chips }: { name: string; role: string; avatarUrl: string | null; chips: string[] }) {
  const reduce = useReducedMotion();
  const [hover, setHover] = useState(false);
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const rotateY = useSpring(useTransform(mx, [0, 1], [-16, 16]), { stiffness: 150, damping: 15 });
  const rotateX = useSpring(useTransform(my, [0, 1], [14, -14]), { stiffness: 150, damping: 15 });
  const px = useTransform(mx, (v) => v * 100);
  const py = useTransform(my, (v) => v * 100);
  const sheen = useMotionTemplate`radial-gradient(circle at ${px}% ${py}%, rgb(255 255 255 / 0.28), transparent 45%)`;
  const holo = useMotionTemplate`linear-gradient(${useTransform(mx, [0, 1], [100, 160])}deg, transparent 20%, oklch(0.87 0.23 135 / 0.22) 40%, oklch(0.66 0.24 305 / 0.28) 55%, transparent 75%)`;

  const chipPos = ["-left-6 top-[12%]", "-right-8 top-[38%]", "-left-10 bottom-[18%]", "-right-4 bottom-[6%]"];

  return (
    <div
      className="relative mx-auto w-[min(78vw,21rem)] [perspective:1100px]"
      onPointerMove={(e) => {
        if (reduce || e.pointerType !== "mouse") return;
        const r = e.currentTarget.getBoundingClientRect();
        mx.set((e.clientX - r.left) / r.width);
        my.set((e.clientY - r.top) / r.height);
      }}
      onPointerEnter={() => setHover(true)}
      onPointerLeave={() => {
        setHover(false);
        mx.set(0.5);
        my.set(0.5);
      }}
    >
      <motion.div
        animate={reduce ? undefined : { y: [0, -12, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="relative aspect-[5/7]"
      >
        {/* Fanned deck */}
        <motion.div className="absolute inset-0" animate={{ rotate: hover ? -17 : -9, x: hover ? -36 : -14 }} transition={{ type: "spring", stiffness: 160, damping: 16 }}>
          <CardBack tone="purple" />
        </motion.div>
        <motion.div className="absolute inset-0" animate={{ rotate: hover ? 15 : 8, x: hover ? 34 : 12 }} transition={{ type: "spring", stiffness: 160, damping: 16 }}>
          <CardBack tone="green" />
        </motion.div>

        {/* Face card */}
        <motion.div
          style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
          className="absolute inset-0 overflow-hidden rounded-[1.75rem] border-2 border-primary/50 bg-[linear-gradient(160deg,oklch(0.26_0.1_305),oklch(0.16_0.04_300))] shadow-[0_30px_80px_-20px_oklch(0.52_0.24_305/0.7)]"
        >
          <Corner />
          <Corner flip />
          <div className="absolute inset-x-12 top-14 bottom-28 overflow-hidden rounded-2xl border-2 border-chart-2/60">
            {avatarUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarUrl} alt={name} className="h-full w-full object-cover" />
            )}
            <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-secondary/60 via-transparent to-transparent" />
          </div>
          <div className="absolute inset-x-6 bottom-8 text-center">
            <p className="font-display text-xl leading-tight font-bold">{name}</p>
            <p className="mt-1 truncate font-mono text-[10px] tracking-wider text-primary uppercase">{role}</p>
          </div>
          <motion.div aria-hidden className="pointer-events-none absolute inset-0 mix-blend-screen" style={{ background: holo }} />
          <motion.div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: sheen }} />
        </motion.div>
      </motion.div>

      {/* Floating tech chips */}
      {chips.slice(0, chipPos.length).map((c, i) => (
        <motion.span
          key={c}
          aria-hidden
          className={`absolute z-10 hidden items-center gap-1.5 sm:flex rounded-full border bg-card/90 px-3 py-1.5 text-xs font-medium shadow-lg backdrop-blur ${chipPos[i]}`}
          initial={{ opacity: 0, scale: 0.6 }}
          animate={reduce ? { opacity: 1, scale: 1 } : { opacity: 1, scale: 1, y: [0, i % 2 ? 8 : -8, 0] }}
          transition={{
            opacity: { delay: 0.8 + i * 0.12 },
            scale: { delay: 0.8 + i * 0.12, type: "spring" },
            y: { duration: 3.5 + i * 0.6, repeat: Infinity, ease: "easeInOut" },
          }}
        >
          <TechIcon name={c} className="h-3.5 w-3.5" decorative />
          {c}
        </motion.span>
      ))}
    </div>
  );
}
