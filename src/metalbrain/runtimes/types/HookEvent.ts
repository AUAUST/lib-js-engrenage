import type { hookEvents } from "#metalbrain/runtimes/constants";

/**
 * Agent runtime event a hook runs on.
 */
export type HookEvent = (typeof hookEvents)[number];
