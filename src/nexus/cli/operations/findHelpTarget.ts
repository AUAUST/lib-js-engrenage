import { freeze } from "@auaust/toolkit/object";

import { rejectCommand } from "#nexus/cli/operations/rejectCommand";
import type { CommandUsageError } from "#nexus/cli/errors/CommandUsageError";
import type { createCommandLookup } from "#nexus/cli/operations/createCommandLookup";
import type { CommandDeclaration } from "#nexus/cli/types/CommandDeclaration";
import type { ParsingCommandDeclaration } from "#nexus/cli/types/ParsingCommandDeclaration";
import type { Resolution } from "#nexus/cli/types/Resolution";
import type { SubcommandMatch } from "#nexus/cli/types/SubcommandMatch";

/**
 * The command `names` lead to from `root`, calling only the loaders up to the
 * one providing each name; a name no source that loads provides adds its usage
 * error to `errors`, naming the group it was looked up in below the root.
 *
 * @throws {TypeError} When an unknown name's group has two sources that load
 * providing one name, the later not shadowable.
 * @throws {Error} When a source provides a name after a loader fails,
 * that loader's error.
 */
export async function findHelpTarget(
  lookup: ReturnType<typeof createCommandLookup>,
  root: ParsingCommandDeclaration,
  names: readonly string[],
  errors: CommandUsageError[],
): Promise<
  | Pick<Extract<Resolution, { kind: "help" }>, "path" | "declaration">
  | undefined
> {
  const path: string[] = [];

  let declaration: CommandDeclaration = root;

  for (const name of names) {
    const group = freeze([root.name, ...path]);

    const match: SubcommandMatch | undefined = declaration.kind === "parsing"
      ? await lookup.find(declaration, group, name)
      : undefined;

    if (match?.kind !== "found") {
      return void errors.push(
        await rejectCommand(lookup, declaration, name, {
          path: group,
          ...(path.length > 0 && { group }),
        }),
      );
    }

    path.push(match.command.name);

    declaration = match.command;
  }

  return { path: freeze(path), declaration };
}
