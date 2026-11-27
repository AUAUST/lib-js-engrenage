import type { Reporter } from "#nexus/reports/index";

export interface RunContext {
  readonly signal: AbortSignal;
  readonly reporter: Reporter;
}
