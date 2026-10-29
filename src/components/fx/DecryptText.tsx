"use client";

import { motion, useMotionValueEvent, useReducedMotion, useScroll } from "motion/react";
import { useEffect, useRef, useState } from "react";

const GLYPHS = "▓▒░█<>/\\{}[]=+*#%&@$?!01ABCDEFXZ";

/** Deterministic ciphertext for a word (same on server and client). */
function cipher(word: string, seed: number) {
  let h = seed * 2654435761;
  return [...word]
    .map(() => {
      h = (h ^ (h >>> 13)) * 1274126177;
      return GLYPHS[Math.abs(h) % GLYPHS.length];
    })
    .join("");
}

/** The word currently being decrypted: flickers through random glyphs. */
function Decoding({ word, seed }: { word: string; seed: number }) {
  const [text, setText] = useState(() => cipher(word, seed));
  useEffect(() => {
    const id = setInterval(() => {
      setText([...word].map((ch, i) => (Math.random() < 0.35 ? ch : GLYPHS[(Math.random() * GLYPHS.length) | 0]) || word[i]).join(""));
    }, 60);
    return () => clearInterval(id);
  }, [word]);
  return (
    <span className="text-highlight" style={{ textShadow: "0 0 10px color-mix(in oklch, var(--primary) 60%, transparent)" }}>
      {text}
    </span>
  );
}

/**
 * Scroll-driven decryption: words start as ciphertext and decode in order as
 * the block scrolls through the viewport. Reports progress (0..1) to the parent.
 */
export function DecryptText({
  text,
  className,
  onProgress,
}: {
  text: string;
  className?: string;
  onProgress?: (p: number) => void;
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLParagraphElement>(null);
  const words = text.split(/\s+/).filter(Boolean);
  const [count, setCount] = useState(reduce ? words.length : 0);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.9", "end 0.5"] });

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    if (reduce) return;
    const next = Math.min(words.length, Math.floor(v * (words.length + 1)));
    setCount(next);
    onProgress?.(next / words.length);
  });

  const revealed = reduce ? words.length : count;

  return (
    <p ref={ref} className={className} aria-label={text}>
      {words.map((word, i) => (
        <span key={i} aria-hidden className="inline-block pr-[0.28em]">
          {i < revealed ? (
            <motion.span initial={reduce ? false : { opacity: 0.4, filter: "blur(3px)" }} animate={{ opacity: 1, filter: "blur(0px)" }} transition={{ duration: 0.3 }}>
              {word}
            </motion.span>
          ) : i === revealed ? (
            <Decoding word={word} seed={i + 1} />
          ) : (
            <span className="font-mono text-muted-foreground/35">{cipher(word, i + 1)}</span>
          )}
        </span>
      ))}
    </p>
  );
}
