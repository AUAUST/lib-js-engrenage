import type { Command, CommandUnknownOpts } from "@commander-js/extra-typings";

import { createCommandDefinition } from "#nexus/cli/operations/createCommandDefinition";
import type { Loadable } from "#foundation/modules/index";
import type { CommandDefinition } from "#nexus/cli/types/CommandDefinition";
import type { CommandParameters } from "#nexus/cli/types/CommandParameters";
import type { DefaultActionParameters } from "#nexus/cli/types/DefaultActionParameters";
import type { ExtendCommand } from "#nexus/cli/types/ExtendCommand";

/**
 * Defines a command loading its action through `action` only when it runs, then
 * running it as `defineCommand` would.
 *
 * @pure
 */
export function defineLazyCommand<
  Configured,
  ActionParameters extends unknown[] | [],
>(definition: {
  configure(command: Command): Configured;
  action(): Promise<Loadable<(...parameters: ActionParameters) => unknown>>;
  extend?(): Promise<Loadable<ExtendCommand>>;
  parse(
    ...parameters: CommandParameters<NoInfer<Configured>>
  ): NoInfer<ActionParameters>;
}): CommandDefinition;
export function defineLazyCommand<Configured>(definition: {
  configure(command: Command): Configured;
  action(): Promise<
    Loadable<
      (...parameters: DefaultActionParameters<NoInfer<Configured>>) => unknown
    >
  >;
  extend?(): Promise<Loadable<ExtendCommand>>;
}): CommandDefinition;
export function defineLazyCommand<
  ActionParameters extends unknown[] | [],
>(definition: {
  action(): Promise<Loadable<(...parameters: ActionParameters) => unknown>>;
  extend?(): Promise<Loadable<ExtendCommand>>;
  parse(...parameters: CommandParameters<Command>): NoInfer<ActionParameters>;
}): CommandDefinition;
export function defineLazyCommand(definition: {
  action(): Promise<
    Loadable<(...parameters: DefaultActionParameters<Command>) => unknown>
  >;
  extend?(): Promise<Loadable<ExtendCommand>>;
}): CommandDefinition;
export function defineLazyCommand({
  configure,
  action,
  extend,
  parse,
}: {
  configure?(command: Command): CommandUnknownOpts;
  action(): Promise<unknown>;
  extend?(): Promise<Loadable<ExtendCommand>>;
  parse?(...parameters: unknown[]): readonly unknown[];
}): CommandDefinition {
  return createCommandDefinition({
    configure,
    load: action,
    extend,
    parse,
  });
}
