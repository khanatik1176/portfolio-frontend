"use client";

import {
  ExternalLink,
  Monitor,
  RotateCw,
  Smartphone,
  Tablet,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { SectionProps } from "@/components/sections/types";
import { PREVIEW_MESSAGE, PREVIEW_READY } from "./meta";
import { IconButton, Segmented } from "./ui";

const DEVICES = {
  desktop: { label: "Desktop", width: 1440, icon: <Monitor /> },
  tablet: { label: "Tablet", width: 820, icon: <Tablet /> },
  mobile: { label: "Mobile", width: 390, icon: <Smartphone /> },
};
type Device = keyof typeof DEVICES;

/**
 * Live preview of one section: an iframe on /admin/preview at a real device
 * width, scaled down to fit the panel, fed the current draft on every change.
 */
export function SectionPreview({
  props,
  className = "",
}: {
  props: SectionProps;
  className?: string;
}) {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const [device, setDevice] = useState<Device>("desktop");
  const [box, setBox] = useState({ width: 0, height: 0 });
  const [ready, setReady] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) =>
      setBox({
        width: entry.contentRect.width,
        height: entry.contentRect.height,
      }),
    );
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (
        e.origin === window.location.origin &&
        e.source === frameRef.current?.contentWindow &&
        e.data?.type === PREVIEW_READY
      )
        setReady(true);
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  useEffect(() => {
    if (ready)
      frameRef.current?.contentWindow?.postMessage(
        { type: PREVIEW_MESSAGE, props },
        window.location.origin,
      );
  }, [ready, props]);

  const width = DEVICES[device].width;
  const scale = box.width ? Math.min(1, box.width / width) : 0;

  return (
    <div
      className={`flex min-h-0 flex-col overflow-hidden rounded-xl border border-border bg-card/80 shadow-sm ${className}`}
    >
      <div className="flex items-center gap-2 border-b border-border px-3 py-2">
        <div className="flex items-center gap-1.5" aria-hidden>
          <span className="size-2.5 rounded-full bg-destructive/60" />
          <span className="size-2.5 rounded-full bg-primary/60" />
          <span className="size-2.5 rounded-full bg-chart-3/60" />
        </div>
        <p className="ml-1 truncate text-xs text-muted-foreground">
          Live preview · {width}px
          {scale > 0 && scale < 1 ? ` · ${Math.round(scale * 100)}%` : ""}
        </p>
        <div className="ml-auto flex items-center gap-1">
          <Segmented
            value={device}
            onChange={setDevice}
            options={Object.entries(DEVICES).map(([value, d]) => ({
              value: value as Device,
              label: d.label,
              icon: d.icon,
            }))}
          />
          <IconButton
            label="Reload preview"
            onClick={() => {
              setReady(false);
              setReloadKey((k) => k + 1);
            }}
          >
            <RotateCw />
          </IconButton>
          <a
            href={`/#${props.section.slug}`}
            target="_blank"
            title="Open on live site"
            aria-label="Open on live site"
            className="inline-grid size-8 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground [&_svg]:size-4"
          >
            <ExternalLink />
          </a>
        </div>
      </div>

      <div
        ref={boxRef}
        className="relative min-h-0 flex-1 overflow-hidden bg-background bg-dots"
      >
        {scale > 0 && (
          <iframe
            key={reloadKey}
            ref={frameRef}
            src="/admin/preview"
            title={`Preview of ${props.section.title}`}
            className="absolute top-0 border-0 bg-background shadow-xl transition-[width] duration-300"
            style={{
              width,
              height: box.height / scale,
              left: Math.max(0, (box.width - width * scale) / 2),
              transform: `scale(${scale})`,
              transformOrigin: "top left",
            }}
          />
        )}
        {!ready && (
          <div className="absolute inset-0 grid place-items-center text-sm text-muted-foreground">
            Loading preview…
          </div>
        )}
      </div>
    </div>
  );
}
