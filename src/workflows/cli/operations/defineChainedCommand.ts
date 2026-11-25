import type { Command, CommandUnknownOpts } from "@commander-js/extra-typings";

import { createCommandDefinition } from "#workflows/cli/operations/createCommandDefinition";
import type { Loadable } from "#foundation/modules/index";
import type { CommandDefinition } from "#workflows/cli/types/CommandDefinition";
import type { CommandParameters } from "#workflows/cli/types/CommandParameters";
import type { ExtendCommand } from "#workflows/cli/types/ExtendCommand";

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
  parse(
    ...parameters: CommandParameters<NoInfer<Configured>>
  ): NoInfer<ActionParameters>;
}): CommandDefinition;
export function defineChainedCommand({
  configure,
  action,
  extend,
  parse,
}: {
  configure(command: Command): CommandUnknownOpts;
  action(): Promise<unknown>;
  extend?(): Promise<Loadable<ExtendCommand>>;
  parse(...parameters: unknown[]): readonly unknown[];
}): CommandDefinition {
  return createCommandDefinition({
    configure,
    load: action,
    extend,
    parse,
    chain: true,
  });
}
