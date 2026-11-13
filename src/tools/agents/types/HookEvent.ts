import type { hookEvents } from "#tools/agents/constants";

/**
 * Agent runtime event a hook runs on.
 */
export type HookEvent = (typeof hookEvents)[number];
