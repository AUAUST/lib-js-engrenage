import { freeze } from "@auaust/toolkit/object";

import type { Loadable } from "#foundation/modules/index";
import type { CommandDeclaration } from "#nexus/cli/types/CommandDeclaration";
import type { CommandMount } from "#nexus/cli/types/CommandMount";

/**
 * Declares a subcommand named `name` and `aliases`, whose declaration `load`
 * loads only once routing matches one of them or every subcommand of its
 * group loads, mounted under them; `origin` names where it loads from in
 * configuration and load errors.
 *
 * @pure
 */
export function commandMount({
  name,
  aliases = [],
  origin,
  load,
}: {
  name: string;
  aliases?: readonly string[];
  origin: string;
  load(): Promise<Loadable<CommandDeclaration>>;
}): CommandMount {
  return freeze({
    kind: "mount",
    name,
    aliases: freeze([...aliases]),
    origin,
    load,
  });
}
