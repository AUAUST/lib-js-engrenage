import type { Reporter } from "#foundation/reports/index";

export interface RunContext {
  signal: AbortSignal;
  readonly reporter: Reporter;
}
