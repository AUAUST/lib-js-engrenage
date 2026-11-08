import type { Command, CommandUnknownOpts } from "@commander-js/extra-typings";

import { isFunction } from "@auaust/toolkit/isFunction";
import { isObject } from "@auaust/toolkit/isObject";
import { freeze } from "@auaust/toolkit/object";

import { commandRegistration } from "#workflows/cli/constants";
import { configureCommand } from "#workflows/cli/operations/configureCommand";
import type { CommandDefinition } from "#workflows/cli/types/CommandDefinition";

type Action = (...parameters: unknown[]) => unknown;

function resolveAction(loaded: unknown, name: string): Action {
  if (isFunction(loaded)) {
    return loaded;
  }

  if (isObject(loaded) && isFunction(loaded, "default")) {
    return loaded.default;
  }

  throw new TypeError(
    `The action of the ${name} command loads neither a function nor a module whose default export is one`,
  );
}

export function createCommandDefinition({
  configure,
  load,
  parse,
}: {
  configure(command: Command): CommandUnknownOpts;
  load(): unknown;
  parse: ((...parameters: unknown[]) => readonly unknown[]) | undefined;
}): CommandDefinition {
  return freeze({
    [commandRegistration](command: Command) {
      configureCommand(command, configure).action(async (...parameters) => {
        const action = resolveAction(await load(), command.name());

        await action(
          ...(parse === undefined ? parameters : parse(...parameters)),
        );
      });
    },
  });
}
