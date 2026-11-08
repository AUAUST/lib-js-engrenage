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

function countDeclarations(command: Command): number {
  return command.registeredArguments.length + command.options.length;
}

function resolveParameters(
  parameters: unknown[],
  {
    parse,
    bare,
  }: {
    parse: ((...parameters: unknown[]) => readonly unknown[]) | undefined;
    bare: boolean;
  },
): readonly unknown[] {
  if (parse !== undefined) {
    return parse(...parameters);
  }

  return bare ? [] : parameters;
}

export function createCommandDefinition({
  configure,
  load,
  parse,
}: {
  configure: ((command: Command) => CommandUnknownOpts) | undefined;
  load(): unknown;
  parse: ((...parameters: unknown[]) => readonly unknown[]) | undefined;
}): CommandDefinition {
  return freeze({
    [commandRegistration](command: Command) {
      const declared = countDeclarations(command);

      if (configure !== undefined) {
        configureCommand(command, configure);
      }

      const bare = countDeclarations(command) === declared;

      command.action(async (...parameters) => {
        const action = resolveAction(await load(), command.name());

        await action(...resolveParameters(parameters, { parse, bare }));
      });
    },
  });
}
