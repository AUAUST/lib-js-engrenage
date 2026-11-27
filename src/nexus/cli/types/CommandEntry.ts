import type { CommandDeclaration } from "#nexus/cli/types/CommandDeclaration";
import type { CommandMount } from "#nexus/cli/types/CommandMount";

/**
 * A subcommand as a group or a source provides it: its declaration, or a mount
 * loading it on a match.
 */
export type CommandEntry = CommandDeclaration | CommandMount;
