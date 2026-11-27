import type { Reporter } from "#nexus/reports/index";

/**
 * How a program run reacts to its environment and failures.
 */
export interface RunSettings {
  readonly signal?: AbortSignal;
  onError?(error: unknown): void;
  readonly debugVariable?: string;
  resolveDebug?(reporter: Reporter): Promise<boolean>;
  explain?(error: unknown): string | undefined;
}
