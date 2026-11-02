"use client";

import { Component, useEffect, useState, type ReactNode } from "react";
import { MotionProvider } from "@/components/fx/MotionProvider";
import { SectionRenderer } from "@/components/sections/SectionRenderer";
import { PREVIEW_MESSAGE, PREVIEW_READY } from "@/components/admin/meta";
import type { SectionProps } from "@/components/sections/types";

/**
 * Renders one section exactly as the public site does, inside the admin's
 * preview iframe. The editor posts the draft section (saved or not) here, so
 * the preview follows every keystroke; a real viewport keeps full-bleed bands
 * and breakpoints honest.
 */
export default function PreviewPage() {
  const [props, setProps] = useState<SectionProps | null>(null);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (
        e.origin !== window.location.origin ||
        e.data?.type !== PREVIEW_MESSAGE
      )
        return;
      setProps(e.data.props as SectionProps);
      setVersion((v) => v + 1);
    };
    window.addEventListener("message", onMessage);
    window.parent.postMessage({ type: PREVIEW_READY }, window.location.origin);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  if (!props) {
    return (
      <div className="grid min-h-screen place-items-center text-sm text-muted-foreground">
        Loading preview…
      </div>
    );
  }

  return (
    <MotionProvider>
      <div className="overflow-x-clip pb-16">
        <main className="mx-auto max-w-[110rem] px-4 lg:px-8">
          <PreviewBoundary resetKey={version}>
            <SectionRenderer {...props} />
          </PreviewBoundary>
        </main>
      </div>
    </MotionProvider>
  );
}

/** Keeps a malformed draft (e.g. half-typed JSON shapes) from blanking the preview; retries on the next edit. */
class PreviewBoundary extends Component<
  { resetKey: number; children: ReactNode },
  { error: Error | null; key: number }
> {
  state = { error: null as Error | null, key: this.props.resetKey };

  static getDerivedStateFromProps(
    props: { resetKey: number },
    state: { key: number },
  ) {
    return props.resetKey !== state.key
      ? { error: null, key: props.resetKey }
      : null;
  }

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div className="mx-auto my-24 max-w-md rounded-xl border border-destructive/40 bg-destructive/10 p-5 text-sm">
          <p className="font-semibold text-destructive">
            This section can&apos;t render with the current content.
          </p>
          <p className="mt-1 text-muted-foreground">
            {this.state.error.message}
          </p>
          <p className="mt-3 text-muted-foreground">
            Check the Content JSON and item data for the shape this section type
            expects.
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}
