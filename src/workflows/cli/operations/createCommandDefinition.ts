import type { Command, CommandUnknownOpts } from "@commander-js/extra-typings";

import { isFunction } from "@auaust/toolkit";
import { freeze } from "@auaust/toolkit/object";

import { loadLazy } from "#foundation/modules/index";
import {
  commandExtension,
  commandRegistration,
} from "#workflows/cli/constants";
import { configureCommand } from "#workflows/cli/operations/configureCommand";
import { runContext } from "#workflows/cli/operations/runContext";
import type { CommandDefinition } from "#workflows/cli/types/CommandDefinition";

async function loadFunction(
  load: () => unknown,
  name: string,
  kind: "action" | "extension",
): Promise<(...parameters: unknown[]) => unknown> {
  const loaded = await loadLazy<unknown>({ load });

  if (!isFunction(loaded)) {
    throw new TypeError(
      `The ${kind} of the ${name} command loads neither a function nor a module whose default or only export is one`,
    );
  }

  return loaded;
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
        const extendCommand = await loadFunction(
          extend,
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
        const action = await loadFunction(load, command.name(), "action");

        // @debt Tests run commands outside runProgram, so the run context stays optional here instead of required through getRunContext.
        // @debt Past this check, an aborted run stops only where its action checks the signal; prompts, config loads and writes ignore it.
        runContext.getStore()?.signal.throwIfAborted();

        await action(...resolveParameters(parameters, { parse, bare }));
      });
    },
  });
}
