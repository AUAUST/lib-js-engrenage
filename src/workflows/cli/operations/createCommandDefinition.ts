import type { Command, CommandUnknownOpts } from "@commander-js/extra-typings";

import { isFunction } from "@auaust/toolkit/isFunction";
import { isObject } from "@auaust/toolkit/isObject";
import { freeze } from "@auaust/toolkit/object";

import {
  commandExtension,
  commandRegistration,
} from "#workflows/cli/constants";
import { configureCommand } from "#workflows/cli/operations/configureCommand";
import type { CommandDefinition } from "#workflows/cli/types/CommandDefinition";

type Loaded = (...parameters: unknown[]) => unknown;

function resolveLoaded(
  loaded: unknown,
  name: string,
  kind: "action" | "extension",
): Loaded {
  if (isFunction(loaded)) {
    return loaded;
  }

  if (isObject(loaded) && isFunction(loaded, "default")) {
    return loaded.default;
  }

  throw new TypeError(
    `The ${kind} of the ${name} command loads neither a function nor a module whose default export is one`,
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

function createExtension(
  extend: () => Promise<unknown>,
): (command: Command) => Promise<void> {
  const extensions = new WeakMap<Command, Promise<void>>();

  return (command) => {
    let extension = extensions.get(command);

    if (extension === undefined) {
      extension = (async () => {
        const extendCommand = resolveLoaded(
          await extend(),
          command.name(),
          "extension",
        );

        await extendCommand(command);
      })();

      extensions.set(command, extension);
    }

    return extension;
  };
}

export function createCommandDefinition({
  configure,
  load,
  extend,
  parse,
}: {
  configure: ((command: Command) => CommandUnknownOpts) | undefined;
  load(): unknown;
  extend: (() => Promise<unknown>) | undefined;
  parse: ((...parameters: unknown[]) => readonly unknown[]) | undefined;
}): CommandDefinition {
  return freeze({
    ...(extend !== undefined && {
      [commandExtension]: createExtension(extend),
    }),
    [commandRegistration](command: Command) {
      const declared = countDeclarations(command);

      if (configure !== undefined) {
        configureCommand(command, configure);
      }

      const bare = countDeclarations(command) === declared;

      command.action(async (...parameters) => {
        const action = resolveLoaded(await load(), command.name(), "action");

        await action(...resolveParameters(parameters, { parse, bare }));
      });
    },
  });
}
