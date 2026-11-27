import type { Command } from "@commander-js/extra-typings";

import { isArray } from "@auaust/toolkit";
import { freeze } from "@auaust/toolkit/object";

import { commandExtension, commandRegistration } from "#nexus/cli/constants";
import { loadCommandFunction } from "#nexus/cli/operations/loadCommandFunction";
import { outputSettling } from "#nexus/cli/operations/outputSettling";
import { runContext } from "#nexus/cli/operations/runContext";
import type { CommandDefinition } from "#nexus/cli/types/CommandDefinition";
import type { ScenarioPrinters } from "#nexus/scenarios/index";

type ParseParameters = (
  parameters: readonly unknown[],
  command: Command,
) => readonly unknown[];

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

/** @pure */
export function createCommandDefinition({
  declare,
  load,
  extension,
  parse,
  printers,
}: {
  declare(command: Command): void;
  load(): unknown;
  extension: ((command: Command) => Promise<void>) | undefined;
  parse: ParseParameters;
  printers: ScenarioPrinters | undefined;
}): CommandDefinition {
  return freeze({
    ...(extension !== undefined && {
      [commandExtension]: extension,
    }),
    /** @effectful */
    [commandRegistration](command: Command) {
      declare(command);

      command.action(async (...values) => {
        rejectEmptyVariadics(command);

        const parameters = parse(values, command);

        await outputSettling.getStore()?.(printers);

        const action = await loadCommandFunction(
          load,
          command.name(),
          "action",
        );

        // @debt Tests run commands outside runProgram, so the run context stays optional here instead of required through getRunContext.
        // @debt Past this check, an aborted run stops only where its action checks the signal; prompts, config loads and writes ignore it.
        runContext.getStore()?.signal.throwIfAborted();

        await action(...parameters);
      });
    },
  });
}
