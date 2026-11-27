import type { CommandPath } from "#nexus/cli/types/CommandPath";

/**
 * A command a help lists apart, at `path`, since its mount's check reports it
 * unavailable for `reason`.
 */
export interface HelpUnavailable {
  readonly path: CommandPath;
  readonly aliases: readonly string[];
  readonly reason: string;
}
