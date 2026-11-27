import type { Command, CommandUnknownOpts } from "@commander-js/extra-typings";

import { bindExtension } from "#nexus/cli/operations/bindExtension";
import { configureCommand } from "#nexus/cli/operations/configureCommand";
import { createCommandDefinition } from "#nexus/cli/operations/createCommandDefinition";
import { loadCommandFunction } from "#nexus/cli/operations/loadCommandFunction";
import type { CommandDefinition } from "#nexus/cli/types/CommandDefinition";
import type { ScenarioPrinters } from "#nexus/scenarios/index";

/**
 * Creates the definition of a command its `configure` declares on its Commander
 * command, `extend` loading what extends that command.
 *
 * @pure
 */
export function createConfiguredDefinition({
  configure,
  load,
  extend,
  parse,
  printers,
  chain,
}: {
  configure: ((command: Command) => CommandUnknownOpts) | undefined;
  load(): unknown;
  extend: (() => Promise<unknown>) | undefined;
  parse: ((...parameters: unknown[]) => readonly unknown[]) | undefined;
  printers: ScenarioPrinters | undefined;
  chain?: boolean;
}): CommandDefinition {
  return createCommandDefinition({
    declare: (
      configure &&
      ((command) => {
        configureCommand(command, configure);
      })
    ),
    load,
    extension: (
      extend &&
      bindExtension(async (command) => {
        const extendCommand = await loadCommandFunction(
          extend,
          command.name(),
          "extension",
        );

        await extendCommand(command);
      })
    ),
    parse: parse && ((parameters) => parse(...parameters)),
    printers,
    ...(chain !== undefined && { chain }),
  });
}
