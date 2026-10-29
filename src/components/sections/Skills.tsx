"use client";

import { motion } from "motion/react";
import type { SectionItem } from "@/lib/types";
import { HackerFeed } from "../fx/HackerFeed";
import { TechIcon } from "../fx/TechIcon";
import { SectionFrame } from "./SectionFrame";
import type { SectionProps } from "./types";

const slugOf = (title: string) =>
  title
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

/**
 * Skills as hacker terminals: each category is a dark terminal window that
 * "types" an `ls` command and lists its skills with icons, over a faint
 * scrolling feed of hacker output.
 */
export function Skills({ section, index }: SectionProps) {
  const total = section.items.reduce((n, i) => n + i.tags.length, 0);

  return (
    <SectionFrame
      section={section}
      index={index}
      surface="dusk"
      className="my-8"
      decor={
        <>
          <HackerFeed className="absolute inset-0" />
        </>
      }
    >
      {/* Session line */}
      <p className="-mt-6 mb-10 font-mono text-xs text-muted-foreground">
        <span className="text-chart-3">kaf@cyberdeck</span>:<span className="text-chart-2">~</span>$ cat loadout.status{" "}
        <span className="text-foreground">
          → <span className="font-bold text-highlight">{total}</span> modules · <span className="font-bold text-highlight">{section.items.length}</span> subsystems ·
          online
        </span>
      </p>

      <div className="columns-1 gap-5 md:columns-2 xl:columns-3">
        {section.items.map((item, i) => (
          <Terminal key={item.id} item={item} index={i} />
        ))}
      </div>
    </SectionFrame>
  );
}

function Terminal({ item, index }: { item: SectionItem; index: number }) {
  const dir = slugOf(item.title);
  const command = `ls ./${dir}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ delay: (index % 3) * 0.08, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="surface-term group mb-5 break-inside-avoid overflow-hidden rounded-md border border-primary/30 shadow-[0_0_40px_-18px_var(--primary)] transition-[border-color,box-shadow] hover:border-primary/70 hover:shadow-[0_0_40px_-10px_var(--primary)]"
    >
      {/* Title bar */}
      <div className="flex items-center justify-between gap-3 border-b bg-muted/60 px-3 py-2 font-mono text-[11px]">
        <span className="truncate text-muted-foreground">
          <span className="text-chart-3">kaf@cyberdeck</span>:~/skills/{dir}
        </span>
        <span className="flex shrink-0 gap-1.5" aria-hidden>
          <span className="h-2.5 w-2.5 bg-primary" />
          <span className="h-2.5 w-2.5 bg-chart-2" />
          <span className="h-2.5 w-2.5 bg-chart-3" />
        </span>
      </div>

      <div className="relative p-4 font-mono text-xs">
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(to_bottom,transparent_0_2px,rgb(0_0_0/0.18)_2px_3px)]" />

        {/* Typed command */}
        <p className="relative flex items-center gap-2">
          <span className="text-chart-3">❯</span>
          <motion.span
            className="overflow-hidden whitespace-nowrap text-foreground"
            initial={{ width: 0 }}
            whileInView={{ width: `${command.length}ch` }}
            viewport={{ once: true }}
            transition={{ duration: command.length * 0.04, ease: (t: number) => Math.floor(t * command.length) / command.length, delay: 0.3 }}
          >
            {command}
          </motion.span>
        </p>
        {item.subtitle && <p className="relative mt-1 text-muted-foreground"># {item.subtitle}</p>}

        {/* Output listing */}
        <motion.ul
          className="relative mt-3 grid grid-cols-2 gap-x-3 gap-y-0.5"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          transition={{ staggerChildren: 0.035, delayChildren: 0.3 + command.length * 0.04 }}
        >
          {item.tags.map((tag) => (
            <motion.li
              key={tag}
              variants={{ hidden: { opacity: 0, x: -6 }, show: { opacity: 1, x: 0 } }}
              className="group/row flex items-center gap-2 rounded-sm px-1.5 py-1 transition-colors hover:bg-primary/10"
            >
              <TechIcon name={tag} className="h-4 w-4 shrink-0" />
              <span className="truncate text-foreground/85 transition-colors group-hover/row:text-highlight">{tag}</span>
              <span className="ml-auto text-[10px] text-chart-3/80">✓</span>
            </motion.li>
          ))}
        </motion.ul>

        {/* Footer */}
        <p className="relative mt-3 flex items-center gap-1 text-muted-foreground">
          <span className="text-highlight">{String(item.tags.length).padStart(2, "0")}</span> modules loaded
          <motion.span
            className="ml-1 inline-block h-3.5 w-2 bg-primary"
            animate={{ opacity: [1, 1, 0, 0] }}
            transition={{ duration: 1, repeat: Infinity, times: [0, 0.5, 0.5, 1] }}
          />
        </p>
      </div>
    </motion.div>
  );
}
