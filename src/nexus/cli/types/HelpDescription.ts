import type { HelpContract } from "#nexus/cli/types/HelpContract";

/**
 * A help's contract, and apart from it the error of each command mount that
 * failed to load, once each.
 */
export interface HelpDescription {
  readonly contract: HelpContract;
  readonly failures: readonly unknown[];
}
