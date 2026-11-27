import type { HelpContract } from "#nexus/cli/types/HelpContract";
import type { HelpUnavailable } from "#nexus/cli/types/HelpUnavailable";

/**
 * A help's contract, and apart from it each command a mount's check reports
 * unavailable, and the error of each command loader, check, mount and layer that
 * failed to load, once each.
 */
export interface HelpDescription {
  readonly contract: HelpContract;
  readonly unavailable: readonly HelpUnavailable[];
  readonly failures: readonly unknown[];
}
