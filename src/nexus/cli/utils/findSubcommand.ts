import { isFunction } from "@auaust/toolkit";

import type { CommandDeclaration } from "#nexus/cli/types/CommandDeclaration";

/**
 * The subcommand `declaration` declares that `name` names, by its name or an
 * alias, calling none of its loaders.
 *
 * @pure
 */
export function findSubcommand(
  declaration: CommandDeclaration,
  name: string,
): CommandDeclaration | undefined {
  return declaration.kind === "parsing"
    ? declaration.subcommands.find(
        (subcommand): subcommand is CommandDeclaration => {
          return (
            !isFunction(subcommand) &&
            (subcommand.name === name || subcommand.aliases.includes(name))
          );
        },
      )
    : undefined;
}
