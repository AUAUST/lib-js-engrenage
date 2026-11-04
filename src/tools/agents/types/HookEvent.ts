import type { hookEvents } from "#tools/agents/constants";

export type HookEvent = (typeof hookEvents)[number];
