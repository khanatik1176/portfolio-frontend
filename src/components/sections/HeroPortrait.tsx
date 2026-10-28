"use client";

import { motion, useTransform, type MotionValue } from "motion/react";
import { LiveClock } from "../fx/LiveClock";
import { TechIcon } from "../fx/TechIcon";

const EASE = [0.22, 1, 0.36, 1] as const;

// Angular panel outline (% of the photo box): chamfered corners plus a notch on the right.
const PANEL_POINTS: [number, number][] = [
  [14, 0], [100, 0], [100, 38], [95, 43], [95, 58], [100, 63], [100, 82], [84, 100], [0, 100], [0, 18],
];
const PANEL_CLIP = `polygon(${PANEL_POINTS.map(([x, y]) => `${x}% ${y}%`).join(", ")})`;
const PANEL_SVG = PANEL_POINTS.map(([x, y]) => `${x},${y}`).join(" ");

// Neon accents come from the site theme.
const NEON_LIME = "var(--primary)";
const NEON_GREEN = "var(--chart-3)";

// Horizontal slices that jump sideways during a glitch burst.
const GLITCH_SLICES = [
  { clip: "inset(22% 0 66% 0)", x: [0, -14, 10, 0] },
  { clip: "inset(48% 0 40% 0)", x: [0, 12, -8, 0] },
  { clip: "inset(71% 0 19% 0)", x: [0, -9, 6, 0] },
];

// Blinking crosshairs (% of the stage); fixed so server and client match.
const CROSSHAIRS = [
  { left: 10, top: 9, color: "lime", delay: 0 },
  { left: 88, top: 16, color: "green", delay: 0.8 },
  { left: 5, top: 60, color: "green", delay: 1.6 },
  { left: 93, top: 76, color: "lime", delay: 0.4 },
  { left: 50, top: 1, color: "lime", delay: 1.2 },
];

const HEXAGON = "polygon(25% 3%, 75% 3%, 100% 50%, 75% 97%, 25% 97%, 0 50%)";
const CUT_PANEL = "polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 14px 100%, 0 calc(100% - 14px))";
const OCTAGON = "29.3,0 70.7,0 100,29.3 100,70.7 70.7,100 29.3,100 0,70.7 0,29.3";

/**
 * Cyberpunk portrait rig on a square stage: an angular neon photo panel (sized
 * to stay inside the 0.5-radius icon orbit), rotating octagon frames, a HUD
 * ring with segments, ticks and a comet, hexagon tech icons, blinking
 * crosshairs, and cut-corner neon readout panels. Layers drift by different
 * amounts with the pointer (mx/my in -1..1).
 */
export function HeroPortrait({
  src,
  alt,
  location,
  timeZone,
  availability,
  stack,
  chips,
  mx,
  my,
}: {
  src: string;
  alt: string;
  location?: string | null;
  timeZone: string;
  availability?: string;
  stack: string[];
  chips: { value: string; label: string }[];
  mx: MotionValue<number>;
  my: MotionValue<number>;
}) {
  const blobX = useTransform(mx, [-1, 1], [26, -26]);
  const blobY = useTransform(my, [-1, 1], [26, -26]);
  const ringX = useTransform(mx, [-1, 1], [14, -14]);
  const ringY = useTransform(my, [-1, 1], [14, -14]);
  const chipX = useTransform(mx, [-1, 1], [-24, 24]);
  const chipY = useTransform(my, [-1, 1], [-24, 24]);
  const rotateY = useTransform(mx, [-1, 1], [-8, 8]);
  const rotateX = useTransform(my, [-1, 1], [6, -6]);

  return (
    <div className="relative mx-auto aspect-square w-full max-w-[280px] sm:max-w-[420px] xl:max-w-[470px]">
      {/* Neon haze + rotating octagon frames behind the panel */}
      <motion.div style={{ x: blobX, y: blobY }} className="pointer-events-none absolute top-[8%] left-[15%] h-[84%] w-[70%]">
        <div
          className="absolute inset-0 opacity-35 blur-3xl"
          style={{ background: `radial-gradient(circle at 30% 30%, ${NEON_LIME}, transparent 60%), radial-gradient(circle at 70% 75%, ${NEON_GREEN}, transparent 60%)` }}
        />
        <motion.svg viewBox="0 0 100 100" className="absolute -inset-[8%] h-[116%] w-[116%] overflow-visible" animate={{ rotate: 360 }} transition={{ duration: 50, repeat: Infinity, ease: "linear" }}>
          <polygon points={OCTAGON} fill="none" stroke={NEON_GREEN} strokeOpacity="0.5" strokeWidth="0.4" strokeDasharray="10 4 2 4" />
        </motion.svg>
        <motion.svg viewBox="0 0 100 100" className="absolute -inset-[2%] h-[104%] w-[104%] overflow-visible" animate={{ rotate: -360 }} transition={{ duration: 35, repeat: Infinity, ease: "linear" }}>
          <polygon points={OCTAGON} fill="none" stroke={NEON_LIME} strokeOpacity="0.35" strokeWidth="0.3" />
        </motion.svg>
      </motion.div>

      {/* HUD ring: tick rim, lime arc segments, green comet, diamond markers */}
      <motion.div style={{ x: ringX, y: ringY }} className="pointer-events-none absolute -inset-[13%] z-20">
        <motion.svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" animate={{ rotate: 360 }} transition={{ duration: 80, repeat: Infinity, ease: "linear" }}>
          {Array.from({ length: 90 }, (_, i) => (
            <line
              key={i}
              x1="50"
              y1="0.6"
              x2="50"
              y2={i % 9 === 0 ? 3 : 1.8}
              stroke={i % 9 === 0 ? NEON_LIME : "currentColor"}
              strokeOpacity={i % 9 === 0 ? 0.9 : 0.25}
              strokeWidth={i % 9 === 0 ? 0.4 : 0.2}
              transform={`rotate(${i * 4} 50 50)`}
            />
          ))}
        </motion.svg>
        <motion.svg
          viewBox="0 0 100 100"
          className="absolute inset-0 h-full w-full"
          style={{ filter: `drop-shadow(0 0 4px ${NEON_LIME})` }}
          animate={{ rotate: -360 }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        >
          <circle cx="50" cy="50" r="46" fill="none" stroke={NEON_LIME} strokeWidth="0.6" strokeDasharray="40 8 4 8 18 8 4 8" opacity="0.8" />
        </motion.svg>
        <motion.svg
          viewBox="0 0 100 100"
          className="absolute inset-0 h-full w-full"
          style={{ filter: `drop-shadow(0 0 6px ${NEON_GREEN})` }}
          animate={{ rotate: 360 }}
          transition={{ duration: 7, repeat: Infinity, ease: "linear" }}
        >
          <defs>
            <linearGradient id="cyber-comet" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor={NEON_GREEN} stopOpacity="0" />
              <stop offset="100%" stopColor={NEON_GREEN} />
            </linearGradient>
          </defs>
          <circle cx="50" cy="50" r="49" fill="none" stroke="url(#cyber-comet)" strokeWidth="1.1" strokeDasharray="34 274" />
          <rect x="97.6" y="48.6" width="2.8" height="2.8" fill={NEON_GREEN} transform="rotate(45 99 50)" />
        </motion.svg>
        <motion.div className="absolute inset-0" animate={{ rotate: -360 }} transition={{ duration: 60, repeat: Infinity, ease: "linear" }}>
          <span className="absolute top-[13%] left-[13%] h-2.5 w-2.5 rotate-45" style={{ background: NEON_LIME, boxShadow: `0 0 10px ${NEON_LIME}` }} />
          <span className="absolute right-[5%] bottom-[30%] h-2 w-2 rotate-45 bg-primary shadow-[0_0_10px_var(--primary)]" />
        </motion.div>
      </motion.div>

      {/* Cyberpunk panel: angular photo, neon double outline drawn over its
          edges, a data stream flowing around the frame, periodic glitch slices. */}
      <motion.div
        style={{ rotateX, rotateY, transformPerspective: 1000 }}
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1, delay: 0.3, ease: EASE }}
        whileHover={{ scale: 1.03 }}
        className="group absolute top-[14%] left-[21%] z-10 h-[72%] w-[58%]"
      >
        {/* Neon bloom behind the panel */}
        <div
          aria-hidden
          className="absolute -inset-4 opacity-60 blur-2xl"
          style={{ clipPath: PANEL_CLIP, background: `linear-gradient(135deg, ${NEON_LIME}, ${NEON_GREEN})` }}
        />

        {/* Photo */}
        <div className="absolute inset-0 overflow-hidden bg-card" style={{ clipPath: PANEL_CLIP }}>
          <motion.img
            src={src}
            alt={alt}
            initial={{ scale: 1.35 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1.8, delay: 0.35, ease: EASE }}
            className="h-full w-full object-cover object-[50%_22%] transition-transform duration-700 group-hover:scale-105"
          />
          {GLITCH_SLICES.map((slice, i) => (
            <motion.img
              key={slice.clip}
              src={src}
              alt=""
              aria-hidden
              style={{ clipPath: slice.clip }}
              animate={{ x: [0, ...slice.x, 0], opacity: [0, 1, 1, 1, 0] }}
              transition={{ duration: 0.35, repeat: Infinity, repeatDelay: 3.6, delay: 2 + i * 0.05, ease: "linear" }}
              className="absolute inset-0 h-full w-full object-cover object-[50%_22%] hue-rotate-60 saturate-200"
            />
          ))}
          <div className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(to_bottom,transparent_0_2px,rgb(0_0_0/0.22)_2px_3px)]" />
          <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-background/60 to-transparent" />
        </div>

        {/* Neon frame over the photo's edge */}
        <motion.svg
          aria-hidden
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="pointer-events-none absolute inset-0 z-10 h-full w-full overflow-visible"
          animate={{ opacity: [1, 1, 0.35, 1, 0.7, 1] }}
          transition={{ duration: 5, repeat: Infinity, times: [0, 0.8, 0.82, 0.85, 0.87, 1] }}
        >
          <polygon
            points={PANEL_SVG}
            fill="none"
            stroke={NEON_GREEN}
            strokeWidth="7"
            vectorEffect="non-scaling-stroke"
            transform="translate(1.2 1)"
            opacity="0.85"
            style={{ filter: `drop-shadow(0 0 6px ${NEON_GREEN})` }}
          />
          <polygon
            points={PANEL_SVG}
            fill="none"
            stroke={NEON_LIME}
            strokeWidth="9"
            vectorEffect="non-scaling-stroke"
            style={{ filter: `drop-shadow(0 0 8px ${NEON_LIME})` }}
          />
          <motion.polygon
            points={PANEL_SVG}
            fill="none"
            stroke="var(--primary)"
            strokeWidth="3"
            strokeDasharray="14 26"
            vectorEffect="non-scaling-stroke"
            animate={{ strokeDashoffset: [0, -400] }}
            transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
          />
        </motion.svg>

        {/* Corner brackets */}
        <span aria-hidden className="absolute -top-3 -right-3 z-10 h-6 w-6 border-t-[3px] border-r-[3px] border-primary" />
        <span aria-hidden className="absolute -bottom-3 -left-3 z-10 h-6 w-6 border-b-[3px] border-l-[3px] border-primary" />

        {/* Tags */}
        <motion.span
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1.4 }}
          className="absolute top-[3%] left-[16%] z-20 -skew-x-12 bg-primary px-2 py-0.5 font-mono text-[10px] font-bold tracking-widest text-primary-foreground"
        >
          ◢ ID://KAF
        </motion.span>
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0.4, 1] }}
          transition={{ delay: 1.6, duration: 0.6 }}
          className="absolute right-[6%] bottom-[8%] z-20 font-mono text-[10px] font-bold tracking-widest"
          style={{ color: NEON_LIME, textShadow: `0 0 8px ${NEON_LIME}` }}
        >
          SYS.ONLINE ▮
        </motion.span>

        {/* Barcode strip along the notch */}
        <div aria-hidden className="absolute top-[45%] -right-5 z-20 flex h-[12%] w-2 flex-col justify-between">
          {[3, 1, 2, 1, 3, 1, 1, 2].map((h, i) => (
            <span key={i} className="block w-full bg-primary" style={{ height: h }} />
          ))}
        </div>
      </motion.div>

      {/* Inner ring: segmented neon track + hexagon tech icons (kept upright) */}
      <motion.svg
        viewBox="0 0 100 100"
        className="pointer-events-none absolute inset-0 z-20 h-full w-full"
        animate={{ rotate: -360 }}
        transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
      >
        <circle cx="50" cy="50" r="49.5" fill="none" stroke={NEON_LIME} strokeOpacity="0.45" strokeWidth="0.3" strokeDasharray="6 2 1 2" />
      </motion.svg>
      {stack.length > 0 && (
        <motion.div
          className="absolute inset-0 z-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, rotate: 360 }}
          transition={{ opacity: { delay: 1.2, duration: 0.6 }, rotate: { duration: 45, repeat: Infinity, ease: "linear" } }}
        >
          {stack.map((s, i) => {
            const a = (i / stack.length) * Math.PI * 2 - Math.PI / 2;
            return (
              <div
                key={s}
                className="absolute -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${50 + 49.5 * Math.cos(a)}%`, top: `${50 + 49.5 * Math.sin(a)}%` }}
              >
                <motion.div animate={{ rotate: -360 }} transition={{ duration: 45, repeat: Infinity, ease: "linear" }}>
                  <motion.div whileHover={{ scale: 1.2 }} className="group/icon relative">
                    {/* Neon edge: outer hexagon in lime (green on hover), inner dark hexagon */}
                    <div
                      className="grid h-11 w-12 place-items-center p-[2px] transition-colors sm:h-13 sm:w-14"
                      style={{ clipPath: HEXAGON, background: NEON_LIME, filter: `drop-shadow(0 0 6px ${NEON_LIME})` }}
                    >
                      <div
                        className="grid h-full w-full place-items-center bg-background transition-colors group-hover/icon:bg-card"
                        style={{ clipPath: HEXAGON }}
                      >
                        <TechIcon name={s} className="h-5 w-5 sm:h-6 sm:w-6" />
                      </div>
                    </div>
                    <span
                      className="absolute inset-0 opacity-0 transition-opacity group-hover/icon:opacity-100"
                      style={{ clipPath: HEXAGON, boxShadow: `inset 0 0 0 2px ${NEON_GREEN}`, background: `color-mix(in oklch, ${NEON_GREEN} 15%, transparent)` }}
                    />
                    <span className="pointer-events-none absolute top-full left-1/2 mt-1.5 -translate-x-1/2 -skew-x-12 bg-primary px-2 py-0.5 font-mono text-[10px] font-bold whitespace-nowrap text-primary-foreground uppercase opacity-0 transition-opacity group-hover/icon:opacity-100">
                      {s}
                    </span>
                  </motion.div>
                </motion.div>
              </div>
            );
          })}
        </motion.div>
      )}

      {/* Blinking crosshairs */}
      {CROSSHAIRS.map((c, i) => {
        const color = c.color === "lime" ? NEON_LIME : NEON_GREEN;
        return (
          <motion.span
            key={i}
            aria-hidden
            className="pointer-events-none absolute h-3 w-3"
            style={{ left: `${c.left}%`, top: `${c.top}%`, filter: `drop-shadow(0 0 4px ${color})` }}
            animate={{ opacity: [0, 1, 0.3, 1, 0], scale: [0.6, 1, 1, 1, 0.6] }}
            transition={{ duration: 2.4, repeat: Infinity, delay: c.delay + 1.5, times: [0, 0.2, 0.3, 0.4, 1] }}
          >
            <span className="absolute top-1/2 left-0 h-px w-full" style={{ background: color }} />
            <span className="absolute top-0 left-1/2 h-full w-px" style={{ background: color }} />
          </motion.span>
        );
      })}

      {/* Readout panels */}
      {chips.map((chip, i) => (
        <motion.div
          key={chip.label}
          style={{ x: chipX, y: chipY, top: `${-4 + i * 16}%` }}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: [0, 1, 0.4, 1] }}
          transition={{ delay: 1.6 + i * 0.2, duration: 0.5 }}
          className="absolute -right-2 z-30 2xl:-right-[9%]"
        >
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 4 + i, repeat: Infinity, ease: "easeInOut" }}
            className="p-px"
            style={{ clipPath: CUT_PANEL, background: `linear-gradient(135deg, ${NEON_GREEN}, ${NEON_LIME})` }}
          >
            <div className="bg-background/95 px-4 py-2.5" style={{ clipPath: CUT_PANEL }}>
              <p className="font-mono text-[9px] tracking-[0.25em] uppercase" style={{ color: NEON_GREEN }}>
                {"// achievement"}
              </p>
              <p className="flex items-baseline gap-2">
                <span className="text-2xl font-black tracking-tighter" style={{ color: NEON_LIME, textShadow: `0 0 10px ${NEON_LIME}` }}>
                  {chip.value}
                </span>
                <span className="font-mono text-xs uppercase">{chip.label}</span>
              </p>
            </div>
          </motion.div>
        </motion.div>
      ))}

      {availability && (
        <motion.div
          style={{ x: chipX, y: chipY }}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0.4, 1] }}
          transition={{ delay: 1.9, duration: 0.5 }}
          className="absolute -bottom-[3%] -left-2 z-30 2xl:-left-[9%]"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="p-px"
            style={{ clipPath: CUT_PANEL, background: `linear-gradient(135deg, ${NEON_LIME}, var(--primary))` }}
          >
            <div className="bg-background/95 px-4 py-2.5 font-mono" style={{ clipPath: CUT_PANEL }}>
              <p className="flex items-center gap-2 text-[11px] font-bold tracking-wider uppercase">
                <span className="h-2 w-2 animate-pulse bg-primary shadow-[0_0_8px_var(--primary)]" />
                {availability}
              </p>
              <p className="mt-1 text-[10px] tracking-wider uppercase" style={{ color: NEON_LIME }}>
                {location && <span>{location} :: </span>}
                <LiveClock timeZone={timeZone} />
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
