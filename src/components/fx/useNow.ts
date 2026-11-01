import { useSyncExternalStore } from "react";

let now: number | undefined;
const noop = () => () => {};

/**
 * The current time, read once per page load in the browser and null while
 * prerendering (Cache Components forbids reading the clock at render time).
 */
export function useNow() {
  return useSyncExternalStore(
    noop,
    () => (now ??= Date.now()),
    () => null,
  );
}
