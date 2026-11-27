import { freeze } from "@auaust/toolkit/object";

import { rejectCommand } from "#nexus/cli/operations/rejectCommand";
import type { CommandUsageError } from "#nexus/cli/errors/CommandUsageError";
import type { createCommandLookup } from "#nexus/cli/operations/createCommandLookup";
import type { CommandDeclaration } from "#nexus/cli/types/CommandDeclaration";
import type { ParsingCommandDeclaration } from "#nexus/cli/types/ParsingCommandDeclaration";
import type { Resolution } from "#nexus/cli/types/Resolution";

/**
 * The command `names` lead to from `root`, calling only the loaders up to the
 * one providing each name; an unknown name adds its usage error to `errors`,
 * naming the group it was looked up in below the root.
 *
 * @throws {TypeError} When an unknown name's group has two sources providing one
 * name, the later not shadowable.
 * @throws {Error} When a loader fails.
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

    const subcommand: CommandDeclaration | undefined = (
      declaration.kind === "parsing"
    )
      ? await lookup.find(declaration, group, name)
      : undefined;

    if (subcommand === undefined) {
      return void errors.push(
        await rejectCommand(lookup, declaration, name, {
          path: group,
          ...(path.length > 0 && { group }),
        }),
      );
    }

    path.push(subcommand.name);

    declaration = subcommand;
  }

  return { path: freeze(path), declaration };
}
