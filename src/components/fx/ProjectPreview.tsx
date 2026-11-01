"use client";

import { motion } from "motion/react";
import { useSyncExternalStore } from "react";
import type { SectionItem } from "@/lib/types";

type Kind = "map" | "dashboard" | "property" | "parcel" | "generic";

/** Picks an illustration from what the project is about. */
function kindOf(item: SectionItem): Kind {
  const text = `${item.title} ${item.subtitle ?? ""} ${item.description ?? ""} ${item.tags.join(" ")}`.toLowerCase();
  if (/parcel|logistic|courier|delivery/.test(text)) return "parcel";
  if (/telematic|fleet|iot|leaflet|vehicle|gps/.test(text)) return "map";
  if (/hospital|health|clinic|patient|saas|admin/.test(text)) return "dashboard";
  if (/property|real estate|housing|rent/.test(text)) return "property";
  return "generic";
}

const mq = "(prefers-reduced-motion: reduce)";
/** Reduced-motion preference that hydrates safely (false on the server). */
function useReducedMotionSafe() {
  return useSyncExternalStore(
    (cb) => {
      const m = matchMedia(mq);
      m.addEventListener("change", cb);
      return () => m.removeEventListener("change", cb);
    },
    () => matchMedia(mq).matches,
    () => false,
  );
}

const Line = ({ w, className = "" }: { w: string; className?: string }) => <span className={`block h-1.5 rounded-full bg-foreground/15 ${className}`} style={{ width: w }} />;

const ROUTE = "M20 215 C 80 215, 95 150, 150 145 S 230 95, 265 100 S 330 60, 385 35";
const ROUTE_B = "M40 30 C 90 60, 120 40, 170 70 S 240 170, 300 165 S 360 200, 390 230";

function FleetMap() {
  const reduce = useReducedMotionSafe();
  return (
    <div className="absolute inset-0 bg-muted">
      <svg viewBox="0 0 400 250" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full">
        {/* River and parks */}
        <path d="M-10 80 C 80 110, 160 40, 250 70 S 360 140, 420 110" fill="none" stroke="var(--chart-2)" strokeOpacity="0.2" strokeWidth="16" />
        <rect x="290" y="160" width="70" height="50" rx="6" fill="var(--chart-3)" fillOpacity="0.15" />
        <rect x="40" y="110" width="55" height="40" rx="6" fill="var(--chart-3)" fillOpacity="0.15" />
        {/* Street grid */}
        {[40, 100, 170, 230].map((y) => (
          <line key={`h${y}`} x1="0" x2="400" y1={y} y2={y + 10} stroke="var(--card)" strokeWidth="5" />
        ))}
        {[60, 140, 220, 300, 360].map((x) => (
          <line key={`v${x}`} y1="0" y2="250" x1={x} x2={x - 15} stroke="var(--card)" strokeWidth="5" />
        ))}
        {/* Routes */}
        <path d={ROUTE_B} fill="none" stroke="var(--chart-2)" strokeWidth="2.5" strokeDasharray="5 5" strokeOpacity="0.7" />
        <path d={ROUTE} fill="none" stroke="var(--primary)" strokeWidth="3" strokeLinecap="round" />
        {/* Vehicles */}
        {[
          { path: ROUTE, color: "var(--primary)", dur: "9s" },
          { path: ROUTE, color: "var(--primary)", dur: "9s", begin: "-4.5s" },
          { path: ROUTE_B, color: "var(--chart-2)", dur: "12s" },
        ].map((v, i) => (
          <g key={i} transform={reduce ? `translate(${[150, 265, 170][i]} ${[145, 100, 70][i]})` : undefined}>
            <circle r="9" fill={v.color} fillOpacity="0.2" />
            <circle r="4.5" fill={v.color} stroke="var(--card)" strokeWidth="1.5" />
            {!reduce && <animateMotion dur={v.dur} begin={v.begin ?? "0s"} repeatCount="indefinite" path={v.path} />}
          </g>
        ))}
        {/* Depot */}
        <circle cx="20" cy="215" r="6" fill="var(--foreground)" />
      </svg>
      <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-lg border bg-card/90 px-2.5 py-1.5 text-[10px] font-medium shadow-sm backdrop-blur">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-chart-3 motion-reduce:animate-none" /> Live tracking
      </div>
      <div className="absolute right-3 bottom-3 w-28 rounded-lg border bg-card/90 p-2.5 shadow-sm backdrop-blur">
        <p className="text-[9px] text-muted-foreground">Telemetry</p>
        <div className="mt-1.5 flex h-8 items-end gap-0.5">
          {[40, 65, 50, 80, 60, 90, 70, 85].map((h, i) => (
            <motion.span
              key={i}
              className="flex-1 rounded-sm bg-primary/70"
              initial={{ height: "10%" }}
              whileInView={{ height: `${h}%` }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 + i * 0.05, duration: 0.5 }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function Dashboard() {
  return (
    <div className="absolute inset-0 flex bg-background">
      <div className="w-[24%] border-r bg-muted/60 p-2.5">
        <span className="mb-3 block h-3 w-3 rounded bg-primary" />
        {["Doctors", "Staff", "Patients", "Admin"].map((r, i) => (
          <p key={r} className={`mb-1 rounded-md px-1.5 py-1 text-[8px] ${i === 0 ? "bg-card font-medium shadow-sm" : "text-muted-foreground"}`}>
            {r}
          </p>
        ))}
      </div>
      <div className="flex-1 p-3">
        <div className="grid grid-cols-3 gap-2">
          {["var(--primary)", "var(--chart-2)", "var(--chart-3)"].map((c) => (
            <div key={c} className="rounded-lg border bg-card p-2">
              <span className="block h-1.5 w-1.5 rounded-full" style={{ background: c }} />
              <Line w="70%" className="mt-2" />
              <span className="mt-1.5 block h-2.5 w-1/2 rounded-full bg-foreground/30" />
            </div>
          ))}
        </div>
        <div className="mt-2 flex h-[45%] items-end gap-1.5 rounded-lg border bg-card p-2.5">
          {[35, 55, 45, 70, 50, 85, 65, 75, 60, 90].map((h, i) => (
            <motion.span
              key={i}
              className={`flex-1 rounded-t-sm ${i === 9 ? "bg-primary" : "bg-chart-2/40"}`}
              initial={{ height: "8%" }}
              whileInView={{ height: `${h}%` }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 + i * 0.04, duration: 0.5 }}
            />
          ))}
        </div>
        <div className="absolute right-3 bottom-3 w-[42%] rounded-xl border bg-card p-2 shadow-md">
          <p className="text-[8px] font-medium">Medical assistant</p>
          <p className="mt-1 w-fit rounded-lg rounded-bl-none bg-muted px-2 py-1 text-[8px] text-muted-foreground">How can I help today?</p>
          <span className="mt-1 ml-auto flex w-fit gap-0.5 rounded-lg rounded-br-none bg-primary px-2 py-1.5">
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                className="h-1 w-1 rounded-full bg-primary-foreground"
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
              />
            ))}
          </span>
        </div>
      </div>
    </div>
  );
}

function Property() {
  const tones = ["from-chart-5/50 to-primary/40", "from-chart-2/40 to-chart-3/40", "from-chart-3/40 to-chart-5/40", "from-primary/30 to-chart-4/30", "from-chart-4/30 to-chart-2/40", "from-chart-5/40 to-chart-3/30"];
  return (
    <div className="absolute inset-0 bg-background p-3">
      <div className="flex items-center gap-2">
        <div className="flex h-6 flex-1 items-center gap-1.5 rounded-full border bg-card px-2.5">
          <span className="h-2 w-2 rounded-full border border-muted-foreground" />
          <Line w="40%" />
        </div>
        <span className="rounded-full bg-chart-3/15 px-2 py-1 text-[8px] font-medium text-chart-3">SEO ✓</span>
        <span className="rounded-full bg-chart-2/15 px-2 py-1 text-[8px] font-medium text-chart-2">CSP ✓</span>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2">
        {tones.map((t, i) => (
          <motion.div
            key={t}
            className="overflow-hidden rounded-lg border bg-card"
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 + i * 0.06 }}
          >
            <div className={`relative h-10 bg-gradient-to-br ${t}`}>
              <svg viewBox="0 0 40 20" className="absolute bottom-0 left-1/2 h-6 -translate-x-1/2 text-card/80" fill="currentColor">
                <path d="M4 20V10l8-6 8 6v10zM22 20V7l7-5 7 5v13z" />
              </svg>
            </div>
            <div className="p-1.5">
              <Line w="75%" />
              <Line w="45%" className="mt-1 bg-primary/40" />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function Parcel() {
  const steps = ["Picked up", "In transit", "Out for delivery", "Delivered"];
  return (
    <div className="absolute inset-0 bg-background p-3">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[9px] text-muted-foreground">TRACK · #PX-2048</span>
        <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[8px] font-medium text-highlight">In transit</span>
      </div>
      <div className="relative mt-4 px-2">
        <div className="absolute top-2 right-6 left-6 h-0.5 rounded-full bg-border" />
        <motion.div
          className="absolute top-2 left-6 h-0.5 rounded-full bg-primary"
          initial={{ width: "0%" }}
          whileInView={{ width: "52%" }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 1.2, ease: "easeInOut" }}
        />
        <div className="relative flex justify-between">
          {steps.map((s, i) => (
            <div key={s} className="flex w-12 flex-col items-center gap-1.5">
              <span className={`grid h-4 w-4 place-items-center rounded-full border-2 ${i < 2 ? "border-primary bg-primary" : "border-border bg-card"}`}>
                {i < 2 && <span className="h-1 w-1 rounded-full bg-primary-foreground" />}
              </span>
              <span className="text-center text-[7px] leading-tight text-muted-foreground">{s}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-4 grid grid-cols-[3fr_2fr] gap-2">
        <div className="rounded-lg border bg-card p-2">
          <p className="text-[8px] text-muted-foreground">Recent parcels</p>
          {[0, 1, 2].map((i) => (
            <div key={i} className="mt-1.5 flex items-center gap-1.5">
              <span className={`h-1.5 w-1.5 rounded-full ${["bg-chart-3", "bg-primary", "bg-chart-2"][i]}`} />
              <Line w={`${[70, 55, 62][i]}%`} />
            </div>
          ))}
        </div>
        <div className="rounded-lg border bg-card p-2">
          <p className="text-[8px] text-muted-foreground">Fare estimate</p>
          <span className="mt-2 block h-3 w-2/3 rounded-full bg-foreground/30" />
          <span className="mt-2 block h-4 rounded-md bg-primary" />
        </div>
      </div>
    </div>
  );
}

function Generic() {
  return (
    <div className="absolute inset-0 bg-background p-4 font-mono text-[9px] leading-relaxed">
      {[60, 45, 80, 30, 70, 50, 65].map((w, i) => (
        <div key={i} className="flex items-center gap-3">
          <span className="w-3 text-right text-muted-foreground/60">{i + 1}</span>
          <Line w={`${w}%`} className={i % 3 === 1 ? "bg-primary/40" : i % 3 === 2 ? "bg-chart-2/40" : ""} />
        </div>
      ))}
    </div>
  );
}

const VIEWS: Record<Kind, () => React.JSX.Element> = { map: FleetMap, dashboard: Dashboard, property: Property, parcel: Parcel, generic: Generic };

/**
 * Browser-window frame around either the project's screenshot (imageUrl) or an
 * illustrated mock of the product, chosen from its title, tags and description.
 */
export function ProjectPreview({ item, className = "" }: { item: SectionItem; className?: string }) {
  const View = VIEWS[kindOf(item)];
  return (
    <div aria-hidden className={`overflow-hidden rounded-2xl border bg-card shadow-sm ${className}`}>
      <div className="flex items-center gap-1.5 border-b bg-muted/60 px-3 py-2">
        <span className="h-2 w-2 rounded-full bg-foreground/15" />
        <span className="h-2 w-2 rounded-full bg-foreground/15" />
        <span className="h-2 w-2 rounded-full bg-foreground/15" />
        <span className="mx-auto max-w-[60%] truncate rounded-md bg-background px-3 py-0.5 text-[10px] text-muted-foreground">{item.title}</span>
        <span className="w-6" />
      </div>
      <div className="relative aspect-[16/10]">
        {item.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.imageUrl} alt="" className="absolute inset-0 h-full w-full object-cover object-top" />
        ) : (
          <View />
        )}
      </div>
    </div>
  );
}
