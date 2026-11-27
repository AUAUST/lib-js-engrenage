import { Command, CommanderError } from "@commander-js/extra-typings";

import { isArray } from "@auaust/toolkit";
import { freeze } from "@auaust/toolkit/object";

import {
  commandExtension,
  commandRegistration,
  invocationSeparator,
} from "#nexus/cli/constants";
import { InvocationsError } from "#nexus/cli/errors/InvocationsError";
import { addRunOptions } from "#nexus/cli/operations/addRunOptions";
import { loadCommandFunction } from "#nexus/cli/operations/loadCommandFunction";
import { outputSettling } from "#nexus/cli/operations/outputSettling";
import { rejectVerbosityConflict } from "#nexus/cli/operations/rejectVerbosityConflict";
import { runContext } from "#nexus/cli/operations/runContext";
import { splitInvocations } from "#nexus/cli/utils/splitInvocations";
import { toUsageError } from "#nexus/cli/utils/toUsageError";
import type { CommandDefinition } from "#nexus/cli/types/CommandDefinition";
import type { InvocationFailure } from "#nexus/cli/types/InvocationFailure";
import type { ScenarioPrinters } from "#nexus/scenarios/index";

type ParseParameters = (
  parameters: readonly unknown[],
  command: Command,
) => readonly unknown[];

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
    declare,
    parse,
  }: {
    declare(command: Command): void;
    parse: ParseParameters;
  },
  receive: (parameters: readonly unknown[]) => Promise<void> | void,
): void {
  declare(command);

  command.action((...parameters) => {
    rejectEmptyVariadics(command);

    return receive(parse(parameters, command));
  });
}

/** @pure */
export function createCommandDefinition({
  declare,
  load,
  extension,
  parse,
  printers,
  chain = false,
}: {
  declare(command: Command): void;
  load(): unknown;
  extension: ((command: Command) => Promise<void>) | undefined;
  parse: ParseParameters;
  printers: ScenarioPrinters | undefined;
  chain?: boolean;
}): CommandDefinition {
  /** @effectful */
  async function parseInvocation(
    command: Command,
    args: readonly string[],
  ): Promise<readonly unknown[]> {
    const twin = createTwin(command);

    let parsed: readonly unknown[] | undefined;

    mountParameters(twin, { declare, parse }, (parameters) => {
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

    // @debt checks verbosity conflicts again after the merge, apart from runProgram's preAction check, since later invocations' run options reach the command only here
    rejectVerbosityConflict(command);

    return parsed;
  }

  /** @effectful */
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
    /** @effectful */
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

      mountParameters(command, { declare, parse }, async (parameters) => {
        const invocations = chain
          ? await parseChain(command, parameters, rest)
          : undefined;

        await outputSettling.getStore()?.(printers);

        const action = await loadCommandFunction(
          load,
          command.name(),
          "action",
        );

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
