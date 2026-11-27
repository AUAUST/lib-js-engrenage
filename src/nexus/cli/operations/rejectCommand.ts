import { helpCommandName } from "#nexus/cli/constants";
import { CommandUsageError } from "#nexus/cli/errors/CommandUsageError";
import { suggestName } from "#nexus/cli/utils/suggestName";
import type { createCommandLookup } from "#nexus/cli/operations/createCommandLookup";
import type { CommandDeclaration } from "#nexus/cli/types/CommandDeclaration";
import type { CommandPath } from "#nexus/cli/types/CommandPath";

/**
 * The usage error for `name`, which no subcommand of `declaration` at `path` from
 * the program's name provides, suggesting the closest name among those every
 * subcommand and loader of it provides, named in `group` when given.
 *
 * @throws {TypeError} When two sources of the group provide one name, the
 * later not shadowable.
 * @throws {Error} When a loader of the group fails.
 */
export async function rejectCommand(
  lookup: ReturnType<typeof createCommandLookup>,
  declaration: CommandDeclaration,
  name: string,
  { path, group }: { path: CommandPath; group?: CommandPath },
): Promise<CommandUsageError> {
  const isRoot = path.length === 1;

  const subcommands = declaration.kind === "parsing"
    ? await lookup.list(declaration, path, isRoot ? [helpCommandName] : [])
    : [];

  const known = subcommands.flatMap((subcommand) => {
    return [subcommand.name, ...subcommand.aliases];
  });

  return new CommandUsageError(
    `unknown command '${name}'${group === undefined ? "" : ` in '${group.join(" ")}'`}${suggestName(name, isRoot ? [...known, helpCommandName] : known)}`,
  );
}
