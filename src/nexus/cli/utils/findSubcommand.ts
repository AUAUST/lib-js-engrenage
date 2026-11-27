import { isFunction } from "@auaust/toolkit";

import type { CommandDeclaration } from "#nexus/cli/types/CommandDeclaration";
import type { CommandEntry } from "#nexus/cli/types/CommandEntry";

/**
 * The subcommand `declaration` declares or mounts that `name` names, by its name
 * or an alias, calling none of its loaders and loading no mount.
 *
 * @pure
 */
export function findSubcommand(
  declaration: CommandDeclaration,
  name: string,
): CommandEntry | undefined {
  return declaration.kind === "parsing"
    ? declaration.subcommands.find((subcommand): subcommand is CommandEntry => {
        return (
          !isFunction(subcommand) &&
          (subcommand.name === name || subcommand.aliases.includes(name))
        );
      })
    : undefined;
}
