import { freeze } from "@auaust/toolkit/object";

import type { Loadable } from "#foundation/modules/index";
import type { ForwardingCommandDeclaration } from "#nexus/cli/types/ForwardingCommandDeclaration";

/**
 * Declares a command passing every argument after its name, options and `--help`
 * included, to the action `action` loads, as they come, such as one forwarding
 * them to another program; it takes no run options of its own.
 *
 * @pure
 */
export function forwardingCommand({
  name,
  aliases = [],
  description,
  action,
}: {
  name: string;
  aliases?: readonly string[];
  description?: string;
  action(): Promise<Loadable<(args: string[]) => unknown>>;
}): ForwardingCommandDeclaration {
  return freeze({
    kind: "forwarding",
    name,
    aliases: freeze([...aliases]),
    ...(description !== undefined && { description }),
    action,
  });
}
