"use client";

import { useSyncExternalStore } from "react";

const subscribe = (cb: () => void) => {
  const id = setInterval(cb, 15_000);
  return () => clearInterval(id);
};

/** Current time in a given IANA time zone; renders a dash on the server. */
export function LiveClock({ timeZone }: { timeZone: string }) {
  const time = useSyncExternalStore(
    subscribe,
    () => new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit", timeZone }).format(new Date()),
    () => "—",
  );
  return <time suppressHydrationWarning>{time}</time>;
}
