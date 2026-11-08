import { Command, type CommandUnknownOpts } from "@commander-js/extra-typings";

import { entries } from "@auaust/toolkit/object";

import type { LegacyCommandDefinition } from "#workflows/cli/types/LegacyCommandDefinition";

// @debt Eager registration coexists with `registerLazySubcommands`, which the engrenage CLI uses: two contracts register subcommands, and here each definition owns its description while lazy entries own it at registration.
export function registerSubcommands<Parent extends CommandUnknownOpts>(
  parent: Parent,
  definitions: Record<string, LegacyCommandDefinition>,
): Parent {
  for (const [name, define] of entries(definitions)) {
    parent.addCommand(define(new Command(name)));
  }

  return parent;
}
