import type { RunFailure } from "#nexus/cli/types/RunFailure";
import type { Reporter } from "#nexus/reports/index";

/**
 * How a program run reacts to its environment and failures.
 */
export interface RunSettings {
  readonly signal?: AbortSignal;
  onError?(error: unknown, failure: RunFailure): Promise<void> | void;
  resolveDebug?(reporter: Reporter): Promise<boolean>;
  explain?(error: unknown): string | undefined;
}
