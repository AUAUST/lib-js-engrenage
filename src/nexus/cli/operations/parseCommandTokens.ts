import { parseArgs, type ParseArgsOptionsConfig } from "node:util";

import { record } from "@auaust/toolkit/object";

import { CommandUsageError } from "#nexus/cli/errors/CommandUsageError";
import { describeOptionFlags } from "#nexus/cli/operations/describeOptionFlags";
import { parseUsageValue } from "#nexus/cli/operations/parseUsageValue";
import type { CommandDeclaration } from "#nexus/cli/types/CommandDeclaration";
import type { CommandTokens } from "#nexus/cli/types/CommandTokens";
import type { OptionDeclaration } from "#nexus/cli/types/OptionDeclaration";
import type { ParsingCommandDeclaration } from "#nexus/cli/types/ParsingCommandDeclaration";

const reservedOptions = {
  help: { type: "boolean", short: "h" },
  version: { type: "boolean", short: "V" },
} as const satisfies ParseArgsOptionsConfig;

// @debt a leaf takes a negative number as an argument even when one of its options has a digit as short flag, where Commander would take it as that option
const negativeNumber = /^-(?:\d+|\d*\.\d+)(?:e[+-]?\d+)?$/u;

function keepValue(value: string): string {
  return value;
}

/** @confined */
function indexOptions(
  declaration: ParsingCommandDeclaration,
  options: readonly OptionDeclaration[],
): ReadonlyMap<string, OptionDeclaration> {
  const known = new Map<string, OptionDeclaration>();

  for (const option of options) {
    if (known.has(option.name) || option.name in reservedOptions) {
      throw new TypeError(
        `The ${declaration.name} command declares the --${option.name} option twice, run and reserved options included`,
      );
    }

    known.set(option.name, option);
  }

  return known;
}

function createParseConfig(
  declaration: ParsingCommandDeclaration,
  known: ReadonlyMap<string, OptionDeclaration>,
): ParseArgsOptionsConfig {
  return {
    help: reservedOptions.help,
    ...(declaration.version !== undefined && {
      version: reservedOptions.version,
    }),
    ...record(
      [...known.values()].map(({ name, type, short }) => {
        return [name, { type, ...(short !== undefined && { short }) }];
      }),
    ),
  };
}

function findSubcommand(
  { subcommands }: ParsingCommandDeclaration,
  name: string,
): CommandDeclaration | undefined {
  return subcommands.find((subcommand) => {
    return subcommand.name === name || subcommand.aliases.includes(name);
  });
}

/**
 * Parses the tokens `args` holds for one command, up to the name of a subcommand
 * when it is a group: its own `options` and the `runOptions`, whose values
 * `runValues` collects across the command path, `--help`, and `--version`
 * when it declares one; an unknown option, a missing or invalid value adds a
 * usage error to `errors`.
 *
 * @throws {TypeError} When two options, run and reserved ones included,
 * share a name.
 * @observing
 */
export function parseCommandTokens(
  declaration: ParsingCommandDeclaration,
  {
    options,
    runOptions,
    runValues,
  }: {
    options: readonly OptionDeclaration[];
    runOptions: readonly OptionDeclaration[];
    runValues: Map<OptionDeclaration, unknown>;
  },
  args: readonly string[],
  errors: CommandUsageError[],
): CommandTokens {
  const runs = new Set(runOptions);
  const known = indexOptions(declaration, [...options, ...runOptions]);
  const isGroup = declaration.subcommands.length > 0;
  const given = new Map<OptionDeclaration, unknown>();
  const positionals: string[] = [];
  const negatives = new Set<number>();

  let blocked = false;

  const { tokens } = parseArgs({
    args: [...args],
    options: createParseConfig(declaration, known),
    strict: false,
    allowPositionals: true,
    tokens: true,
  });

  for (const token of tokens) {
    if (token.kind === "option-terminator") {
      continue;
    }

    if (token.kind === "positional") {
      const subcommand = isGroup && !blocked && positionals.length === 0
        ? findSubcommand(declaration, token.value)
        : undefined;

      if (subcommand !== undefined) {
        return {
          route: {
            declaration: subcommand,
            args: args.slice(token.index + 1),
          },
          given,
          positionals,
          blocked,
        };
      }

      positionals.push(token.value);

      continue;
    }

    if (token.name === "help") {
      return {
        request: "help",
        given,
        positionals,
        blocked,
      };
    }

    if (token.name === "version" && declaration.version !== undefined) {
      return {
        request: "version",
        given,
        positionals,
        blocked,
      };
    }

    const option = known.get(token.name);
    const raw = args[token.index] ?? token.rawName;

    if (
      option === undefined ||
      (option.type === "boolean" && token.inlineValue === true)
    ) {
      if (!isGroup && negativeNumber.test(raw)) {
        if (!negatives.has(token.index)) {
          negatives.add(token.index);
          positionals.push(raw);
        }

        continue;
      }

      errors.push(
        new CommandUsageError(
          `unknown option '${token.inlineValue === true ? raw : token.rawName}'`,
        ),
      );

      blocked = isGroup;

      continue;
    }

    const target = runs.has(option) ? runValues : given;

    if (option.type === "boolean") {
      target.set(option, true);

      continue;
    }

    const flags = describeOptionFlags(option);

    if (token.value === undefined) {
      errors.push(new CommandUsageError(`option '${flags}' argument missing`));

      continue;
    }

    target.set(
      option,
      parseUsageValue(
        {
          invalid: `option '${flags}' argument '${token.value}' is invalid.`,
          choices: option.choices,
          parse: option.parse ?? keepValue,
        },
        token.value,
        target.has(option) ? target.get(option) : option.default,
        errors,
      ),
    );
  }

  return {
    given,
    positionals,
    blocked,
  };
}
