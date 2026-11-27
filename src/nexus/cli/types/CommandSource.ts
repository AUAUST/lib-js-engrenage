import type { CommandDeclaration } from "#nexus/cli/types/CommandDeclaration";

/**
 * What a command loader loads beside a command or a list of them: its commands,
 * and whether a name an earlier subcommand or loader of its group provides
 * yields to it, instead of failing as a configuration error where every loader
 * of the group loads.
 */
export interface CommandSource {
  readonly kind: "source";
  readonly commands: readonly CommandDeclaration[];
  readonly shadowable: boolean;
}
