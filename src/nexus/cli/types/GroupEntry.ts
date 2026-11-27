import type { CommandDefinition } from "#nexus/cli/types/CommandDefinition";

/**
 * A command a group registers, alone or with the aliases it also answers to.
 */
export type GroupEntry =
  | CommandDefinition
  | {
      readonly command: CommandDefinition;
      readonly aliases: readonly string[];
    };
