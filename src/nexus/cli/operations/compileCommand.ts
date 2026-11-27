import {
  Argument,
  InvalidArgumentError,
  Option,
  type Command,
  type CommandUnknownOpts,
} from "@commander-js/extra-typings";

import { isArray, isFunction } from "@auaust/toolkit";
import { freeze, record } from "@auaust/toolkit/object";

import { commandForwarding } from "#nexus/cli/constants";
import { CommandUsageError } from "#nexus/cli/errors/CommandUsageError";
import { bindExtension } from "#nexus/cli/operations/bindExtension";
import { createCommandDefinition } from "#nexus/cli/operations/createCommandDefinition";
import { createGroupDefinition } from "#nexus/cli/operations/createGroupDefinition";
import { describeOptionFlags } from "#nexus/cli/operations/describeOptionFlags";
import { loadCommandFunction } from "#nexus/cli/operations/loadCommandFunction";
import type { ArgumentDeclaration } from "#nexus/cli/types/ArgumentDeclaration";
import type { CommandDeclaration } from "#nexus/cli/types/CommandDeclaration";
import type { CommandDefinition } from "#nexus/cli/types/CommandDefinition";
import type { CommandPath } from "#nexus/cli/types/CommandPath";
import type { ForwardingCommandDeclaration } from "#nexus/cli/types/ForwardingCommandDeclaration";
import type { LayerLoader } from "#nexus/cli/types/LayerLoader";
import type { OptionDeclaration } from "#nexus/cli/types/OptionDeclaration";
import type { ParsingCommandDeclaration } from "#nexus/cli/types/ParsingCommandDeclaration";

type DeclaredOptions = Map<OptionDeclaration, Option>;

function readCommandPath(command: Command): CommandPath {
  const names: string[] = [];

  for (
    let current: CommandUnknownOpts | null = command;
    current?.parent != null;
    current = current.parent
  ) {
    names.unshift(current.name());
  }

  return freeze(names);
}

async function loadLayer<Value>(
  loader: LayerLoader<Value>,
  command: Command,
  kind: string,
): Promise<Value> {
  const resolve = await loadCommandFunction(loader, command.name(), kind);

  return resolve(readCommandPath(command));
}

function createParser(
  choices: readonly string[] | undefined,
  parse: (value: string, previous: unknown) => unknown,
): (value: string, previous: unknown) => unknown {
  return (value, previous) => {
    if (choices !== undefined && !choices.includes(value)) {
      throw new InvalidArgumentError(
        `Allowed choices are ${choices.join(", ")}.`,
      );
    }

    try {
      return parse(value, previous);
    } catch (error) {
      if (error instanceof CommandUsageError) {
        throw new InvalidArgumentError(error.message);
      }

      throw error;
    }
  };
}

function toAttributeName(name: string): string {
  return new Option(`--${name}`).attributeName();
}

function createOption(declaration: OptionDeclaration): Option {
  const option = new Option(
    describeOptionFlags(declaration),
    declaration.description,
  );

  if (declaration.default !== undefined) {
    option.default(declaration.default);
  }

  if (declaration.required) {
    option.makeOptionMandatory();
  }

  if (declaration.conflicts.length > 0) {
    option.conflicts(declaration.conflicts.map(toAttributeName));
  }

  if (declaration.choices !== undefined) {
    option.choices(declaration.choices);
  }

  if (declaration.parse !== undefined) {
    option.argParser(
      createParser(declaration.choices, (value, previous) => {
        return declaration.parse?.(value, previous);
      }),
    );
  }

  return option;
}

function applyChoices(
  argument: Argument,
  declaration: ArgumentDeclaration,
  choices: readonly string[] | undefined,
): void {
  if (choices !== undefined) {
    argument.choices(choices);
  }

  argument.argParser(
    createParser(choices, (value, previous) => {
      return declaration.parse(value, previous);
    }),
  );
}

function createArgument(declaration: ArgumentDeclaration): Argument {
  const name = declaration.variadic
    ? `${declaration.name}...`
    : declaration.name;

  const argument = new Argument(
    declaration.optional ? `[${name}]` : `<${name}>`,
    declaration.description,
  );

  applyChoices(
    argument,
    declaration,
    isArray(declaration.choices) ? declaration.choices : undefined,
  );

  return argument;
}

function addOptions(
  command: Command,
  declarations: readonly OptionDeclaration[],
  declared: DeclaredOptions,
): void {
  for (const declaration of declarations) {
    const option = createOption(declaration);

    command.addOption(option);
    declared.set(declaration, option);
  }
}

function addHelpAfter(command: Command, text: string): void {
  command.addHelpText("after", `\n${text}`);
}

function readOptionValues(
  command: Command,
  declared: DeclaredOptions,
  only?: (declaration: OptionDeclaration) => boolean,
): Readonly<Record<string, unknown>> {
  return record(
    [...declared]
      .filter(([declaration]) => {
        return only?.(declaration) ?? true;
      })
      .map(([{ name }, option]) => {
        return [name, command.getOptionValue(option.attributeName())];
      }),
  );
}

function declareMeta(
  command: Command,
  { description, version }: ParsingCommandDeclaration,
): void {
  command.enablePositionalOptions();

  if (description !== undefined) {
    command.description(description);
  }

  if (version !== undefined) {
    command.version(version);
  }
}

function compileAction(
  declaration: ParsingCommandDeclaration,
  action: () => Promise<unknown>,
  declareGroup: boolean,
): CommandDefinition {
  const declarations = new WeakMap<Command, DeclaredOptions>();

  const statics = new Set<OptionDeclaration>();

  const loaders: LayerLoader<readonly OptionDeclaration[]>[] = [];

  for (const entry of declaration.options) {
    if (isFunction(entry)) {
      loaders.push(entry);
    } else {
      statics.add(entry);
    }
  }

  function getDeclared(command: Command): DeclaredOptions {
    let declared = declarations.get(command);

    if (declared === undefined) {
      declared = new Map();

      declarations.set(command, declared);
    }

    return declared;
  }

  const { after } = declaration.help;

  const loadsLayers = (
    loaders.length > 0 ||
    isFunction(after) ||
    declaration.arguments.some(({ choices }) => isFunction(choices))
  );

  return createCommandDefinition({
    declare(command) {
      if (declareGroup) {
        declareMeta(command, declaration);
      }

      for (const argument of declaration.arguments) {
        command.addArgument(createArgument(argument));
      }

      addOptions(command, [...statics], getDeclared(command));

      if (after !== undefined && !isFunction(after)) {
        addHelpAfter(command, after);
      }
    },
    load: action,
    extension: loadsLayers
      ? bindExtension(async (command) => {
          const [lists, choices, text] = await Promise.all([
            Promise.all(
              loaders.map((loader) => {
                return loadLayer(loader, command, "options");
              }),
            ),
            Promise.all(
              declaration.arguments.map(({ choices }) => {
                return isFunction(choices)
                  ? loadLayer(choices, command, "choices")
                  : undefined;
              }),
            ),
            isFunction(after) ? loadLayer(after, command, "help") : undefined,
          ]);

          for (const list of lists) {
            addOptions(command, list, getDeclared(command));
          }

          for (const [index, loaded] of choices.entries()) {
            const argument = command.registeredArguments[index];
            const argumentDeclaration = declaration.arguments[index];

            if (
              loaded !== undefined &&
              argument !== undefined &&
              argumentDeclaration !== undefined
            ) {
              applyChoices(argument, argumentDeclaration, loaded);
            }
          }

          if (text !== undefined) {
            addHelpAfter(command, text);
          }
        })
      : undefined,
    parse(parameters, command) {
      const declared = getDeclared(command);

      const values = [
        ...parameters.slice(0, declaration.arguments.length),
        ...(declaration.options.length > 0
          ? [
              readOptionValues(command, declared, (option) => {
                return statics.has(option);
              }),
            ]
          : []),
      ];

      if (declaration.parse === undefined) {
        return values;
      }

      return declaration.parse(...values, {
        path: readCommandPath(command),
        options: readOptionValues(command, declared),
      });
    },
    printers: declaration.printers,
  });
}

function compileForwarding({
  description,
  action,
}: ForwardingCommandDeclaration): CommandDefinition {
  const definition: CommandDefinition = {
    ...createCommandDefinition({
      declare(command) {
        command
          .helpOption(false)
          .passThroughOptions()
          .allowUnknownOption()
          .allowExcessArguments();

        if (description !== undefined) {
          command.description(description);
        }
      },
      load: action,
      extension: undefined,
      parse(_parameters, command) {
        return [[...command.args]];
      },
      printers: undefined,
    }),
    [commandForwarding]: true,
  };

  return freeze(definition);
}

/**
 * Compiles a command declaration into the definition registering it on a Commander
 * command, its subcommands and their aliases included.
 *
 * @throws {TypeError} When the declaration or one of its subcommands chains
 * invocations or declares neither an action nor subcommands.
 * @pure
 */
export function compileCommand(
  declaration: CommandDeclaration,
): CommandDefinition {
  if (declaration.kind === "forwarding") {
    return compileForwarding(declaration);
  }

  const { action, subcommands } = declaration;

  if (declaration.chain) {
    throw new TypeError(
      `The ${declaration.name} command chains invocations, which only nexus's engine runs`,
    );
  }

  if (subcommands.length === 0) {
    if (action === undefined) {
      throw new TypeError(
        `The ${declaration.name} command declares neither an action nor subcommands`,
      );
    }

    return compileAction(declaration, () => action(), true);
  }

  return createGroupDefinition({
    declare(command) {
      declareMeta(command, declaration);
    },
    commands: record(
      subcommands.map((subcommand) => {
        return [
          subcommand.name,
          {
            command: compileCommand(subcommand),
            aliases: subcommand.aliases,
          },
        ];
      }),
    ),
    command: action === undefined
      ? undefined
      : compileAction(declaration, () => action(), false),
  });
}
