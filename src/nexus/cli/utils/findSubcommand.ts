import type { CommandDeclaration } from "#nexus/cli/types/CommandDeclaration";

/**
 * The subcommand of `declaration` that `name` names, by its name or an alias.
 *
 * @pure
 */
export function findSubcommand(
  declaration: CommandDeclaration,
  name: string,
): CommandDeclaration | undefined {
  return declaration.kind === "parsing"
    ? declaration.subcommands.find((subcommand) => {
        return subcommand.name === name || subcommand.aliases.includes(name);
      })
    : undefined;
}
