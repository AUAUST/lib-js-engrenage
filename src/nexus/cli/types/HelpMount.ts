import type { CommandPath } from "#nexus/cli/types/CommandPath";
import type { HelpFacts } from "#nexus/cli/types/HelpFacts";

/**
 * What a listed command states only at `paths`, beyond what every path of
 * its listing shares.
 */
export interface HelpMount extends HelpFacts {
  readonly paths: readonly CommandPath[];
}
