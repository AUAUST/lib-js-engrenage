import type { Command } from "@commander-js/extra-typings";

import { freeze } from "@auaust/toolkit/object";

import { commandForwarding } from "#nexus/cli/constants";
import { defineLazyCommand } from "#nexus/cli/operations/defineLazyCommand";
import type { Loadable } from "#foundation/modules/index";
import type { CommandDefinition } from "#nexus/cli/types/CommandDefinition";

/**
 * Defines a lazily loaded command passing every argument after its name, options
 * and `--help` included, to its action as they come, such as one forwarding them
 * to another program; it takes no run options of its own.
 */
export function defineForwardingCommand({
  configure,
  action,
}: {
  configure?(command: Command): Command;
  action(): Promise<Loadable<(args: string[]) => unknown>>;
}): CommandDefinition {
  const definition: CommandDefinition = {
    ...defineLazyCommand({
      configure(command) {
        const forwarding = command
          .helpOption(false)
          .passThroughOptions()
          .allowUnknownOption()
          .allowExcessArguments();

        return configure === undefined ? forwarding : configure(forwarding);
      },
      action,
      parse(_options, command) {
        return [[...command.args]];
      },
    }),
    [commandForwarding]: true,
  };

  return freeze(definition);
}
