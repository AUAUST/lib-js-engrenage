import type { CommandPath } from "#nexus/cli/types/CommandPath";
import type { HelpFacts } from "#nexus/cli/types/HelpFacts";
import type { HelpMount } from "#nexus/cli/types/HelpMount";

/**
 * A command help lists once at every path mounting it, or sibling groups mounting
 * the same commands listed as one: the facts every path shares, then the mounts
 * stating what only some paths have.
 */
export interface HelpListing extends HelpFacts {
  readonly paths: readonly CommandPath[];
  readonly kind: "group" | "command" | "forwarding";
  /**
   * What follows the path in a call, such as `<id> [options]`.
   */
  readonly usage: string;
  /**
   * Whether a run may chain the command with others through `--next`: `false`
   * for a forwarding command or one declaring itself unchainable, which makes
   * every command below it unchainable too.
   */
  readonly chainable: boolean;
  readonly mounts: readonly HelpMount[];
}
