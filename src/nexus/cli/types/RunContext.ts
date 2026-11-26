import type { Reporter } from "#foundation/reports/index";

export interface RunContext {
  readonly signal: AbortSignal;
  readonly reporter: Reporter;
}
