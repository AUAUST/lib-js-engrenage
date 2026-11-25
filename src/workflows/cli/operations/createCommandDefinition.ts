import {
  Command,
  CommanderError,
  type CommandUnknownOpts,
} from "@commander-js/extra-typings";

import { isArray, isFunction } from "@auaust/toolkit";
import { freeze } from "@auaust/toolkit/object";

import { loadLazy } from "#foundation/modules/index";
import {
  commandExtension,
  commandRegistration,
  invocationSeparator,
} from "#workflows/cli/constants";
import { InvocationsError } from "#workflows/cli/errors/InvocationsError";
import { addRunOptions } from "#workflows/cli/operations/addRunOptions";
import { configureCommand } from "#workflows/cli/operations/configureCommand";
import { runContext } from "#workflows/cli/operations/runContext";
import { toUsageError } from "#workflows/cli/utils/toUsageError";
import type { CommandDefinition } from "#workflows/cli/types/CommandDefinition";
import type { InvocationFailure } from "#workflows/cli/types/InvocationFailure";

type ParseParameters = (...parameters: unknown[]) => readonly unknown[];

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

function splitInvocations(args: readonly string[]): string[][] {
  const invocations: string[][] = [[]];

  for (const [index, arg] of args.entries()) {
    if (arg === "--") {
      invocations.at(-1)?.push(...args.slice(index));

      break;
    }

    if (arg === invocationSeparator) {
      invocations.push([]);
    } else {
      invocations.at(-1)?.push(arg);
    }
  }

  return invocations;
}

// @debt each later invocation parses on a twin under stand-ins named after the command's ancestors, so parse and extensions read the group names without running the ancestors' hooks; a parse contract receiving the group names would spare them
function createTwin(command: Command): Command {
  const twin = new Command(command.name());

  let child: Command = twin;

  for (
    let ancestor = command.parent;
    ancestor !== null;
    ancestor = ancestor.parent
  ) {
    const standIn = new Command(ancestor.name());

    standIn.addCommand(child);

    child = standIn;
  }

  return twin;
}

// @debt repeats Commander's missing-argument message and code, since Commander checks a required variadic argument before its parser can empty it and exposes no public missingArgument
function rejectEmptyVariadics(command: Command): void {
  for (const [index, argument] of command.registeredArguments.entries()) {
    const value: unknown = command.processedArgs[index];

    if (
      argument.required &&
      argument.variadic &&
      isArray(value) &&
      value.length === 0
    ) {
      command.error(`error: missing required argument '${argument.name()}'`, {
        code: "commander.missingArgument",
      });
    }
  }
}

function mountParameters(
  command: Command,
  {
    configure,
    parse,
  }: {
    configure: ((command: Command) => CommandUnknownOpts) | undefined;
    parse: ParseParameters | undefined;
  },
  receive: (parameters: readonly unknown[]) => Promise<void> | void,
): void {
  const declared = countDeclarations(command);

  if (configure !== undefined) {
    configureCommand(command, configure);
  }

  const bare = countDeclarations(command) === declared;

  command.action((...parameters) => {
    rejectEmptyVariadics(command);

    if (parse !== undefined) {
      return receive(parse(...parameters));
    }

    return receive(bare ? [] : parameters);
  });
}

export function createCommandDefinition({
  configure,
  load,
  extend,
  parse,
  chain = false,
}: {
  configure: ((command: Command) => CommandUnknownOpts) | undefined;
  load(): unknown;
  extend: (() => Promise<unknown>) | undefined;
  parse: ParseParameters | undefined;
  chain?: boolean;
}): CommandDefinition {
  const extension = extend === undefined ? undefined : createExtension(extend);

  async function parseInvocation(
    command: Command,
    args: readonly string[],
  ): Promise<readonly unknown[]> {
    const twin = createTwin(command);

    let parsed: readonly unknown[] | undefined;

    mountParameters(twin, { configure, parse }, (parameters) => {
      parsed = parameters;
    });

    await extension?.(twin);

    const declared = new Set(twin.options);

    addRunOptions(twin);

    const runOptions = twin.options.filter((option) => {
      return !declared.has(option);
    });

    twin.exitOverride().configureOutput({
      outputError() {},
    });

    await twin.parseAsync(args, { from: "user" });

    if (parsed === undefined) {
      throw new Error(`The ${command.name()} command took no action`);
    }

    for (const option of runOptions) {
      const name = option.attributeName();

      if (twin.getOptionValueSource(name) === "cli") {
        command.setOptionValueWithSource(
          name,
          twin.getOptionValue(name),
          "cli",
        );
      }
    }

    return parsed;
  }

  async function parseChain(
    command: Command,
    first: readonly unknown[],
    rest: readonly (readonly string[])[],
  ): Promise<(readonly unknown[])[]> {
    const invocations = [first];

    const failures: InvocationFailure[] = [];

    for (const [index, args] of rest.entries()) {
      try {
        invocations.push(await parseInvocation(command, args));
      } catch (error) {
        failures.push({
          position: index + 2,
          error: error instanceof CommanderError ? toUsageError(error) : error,
        });
      }
    }

    if (failures.length > 0) {
      throw new InvocationsError(failures, rest.length + 1);
    }

    return invocations;
  }

  return freeze({
    ...(extension !== undefined && {
      [commandExtension]: extension,
    }),
    [commandRegistration](command: Command) {
      let rest: (readonly string[])[] = [];

      if (chain) {
        // @debt splits invocations by overriding the instance's parseOptions, since Commander parses one invocation per command; a usage error in invocation 1 stops Commander before later invocations are checked, naming no position
        const parseOptions = command.parseOptions.bind(command);

        command.parseOptions = (args) => {
          const [first = [], ...others] = splitInvocations(args);

          rest = others;

          return parseOptions(first);
        };

        command.addHelpText(
          "after",
          `\nChain invocations by separating them with ${invocationSeparator}, writing --<option>=${invocationSeparator} for the text ${invocationSeparator}; nothing takes effect unless every invocation succeeds.`,
        );
      }

      mountParameters(command, { configure, parse }, async (parameters) => {
        const invocations = chain
          ? await parseChain(command, parameters, rest)
          : undefined;

        const action = await loadFunction(load, command.name(), "action");

        // @debt Tests run commands outside runProgram, so the run context stays optional here instead of required through getRunContext.
        // @debt Past this check, an aborted run stops only where its action checks the signal; prompts, config loads and writes ignore it.
        runContext.getStore()?.signal.throwIfAborted();

        await (invocations === undefined
          ? action(...parameters)
          : action(invocations));
      });
    },
  });
}
