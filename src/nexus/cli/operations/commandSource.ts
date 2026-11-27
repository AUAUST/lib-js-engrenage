import { freeze } from "@auaust/toolkit/object";

import type { CommandEntry } from "#nexus/cli/types/CommandEntry";
import type { CommandSource } from "#nexus/cli/types/CommandSource";

/**
 * Declares `commands`, commands and mounts, for a command loader to load, a
 * name an earlier subcommand or loader of their group provides yielding to
 * it with `shadowable`.
 *
 * @pure
 */
export function commandSource({
  commands,
  shadowable = false,
}: {
  commands: readonly CommandEntry[];
  shadowable?: boolean;
}): CommandSource {
  return freeze({
    kind: "source",
    commands: freeze([...commands]),
    shadowable,
  });
}
