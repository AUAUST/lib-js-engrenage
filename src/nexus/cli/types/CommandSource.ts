import type { CommandEntry } from "#nexus/cli/types/CommandEntry";

/**
 * What a command loader loads beside a command entry or a list of them: its
 * entries, and whether a name an earlier subcommand or loader of its group
 * provides yields to it, instead of failing as a configuration error where every
 * loader of the group loads.
 */
export interface CommandSource {
  readonly kind: "source";
  readonly commands: readonly CommandEntry[];
  readonly shadowable: boolean;
}
