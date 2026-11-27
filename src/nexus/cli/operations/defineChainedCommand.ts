import type { Command, CommandUnknownOpts } from "@commander-js/extra-typings";

import { createCommandDefinition } from "#nexus/cli/operations/createCommandDefinition";
import type { Loadable } from "#foundation/modules/index";
import type { CommandDefinition } from "#nexus/cli/types/CommandDefinition";
import type { CommandParameters } from "#nexus/cli/types/CommandParameters";
import type { ExtendCommand } from "#nexus/cli/types/ExtendCommand";
import type { ScenarioPrinters } from "#nexus/scenarios/index";

/**
 * Defines a lazily loaded command whose call chains several invocations, separated
 * by `--next` arguments before any `--`: Commander parses each against the
 * command, and the action receives every invocation's parsed values in order,
 * once all of them parse.
 *
 * @throws {InvocationsError} When any of several invocations fails to parse,
 * naming each by its position; the action then never runs.
 */
export function defineChainedCommand<
  Configured,
  ActionParameters extends unknown[] | [],
>(definition: {
  configure(command: Command): Configured;
  action(): Promise<
    Loadable<(invocations: readonly ActionParameters[]) => unknown>
  >;
  extend?(): Promise<Loadable<ExtendCommand>>;
  printers?: ScenarioPrinters;
  parse(
    ...parameters: CommandParameters<NoInfer<Configured>>
  ): NoInfer<ActionParameters>;
}): CommandDefinition;
export function defineChainedCommand({
  configure,
  action,
  extend,
  parse,
  printers,
}: {
  configure(command: Command): CommandUnknownOpts;
  action(): Promise<unknown>;
  extend?(): Promise<Loadable<ExtendCommand>>;
  printers?: ScenarioPrinters;
  parse(...parameters: unknown[]): readonly unknown[];
}): CommandDefinition {
  return createCommandDefinition({
    configure,
    load: action,
    extend,
    parse,
    printers,
    chain: true,
  });
}
