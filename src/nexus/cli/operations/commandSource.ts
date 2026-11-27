import { freeze } from "@auaust/toolkit/object";

import type { CommandDeclaration } from "#nexus/cli/types/CommandDeclaration";
import type { CommandSource } from "#nexus/cli/types/CommandSource";

/**
 * Declares `commands` for a command loader to load, a name an earlier subcommand
 * or loader of their group provides yielding to it with `shadowable`.
 *
 * @pure
 */
export function commandSource({
  commands,
  shadowable = false,
}: {
  commands: readonly CommandDeclaration[];
  shadowable?: boolean;
}): CommandSource {
  return freeze({
    kind: "source",
    commands: freeze([...commands]),
    shadowable,
  });
}
