import { parseArgs, type ParseArgsOptionsConfig } from "node:util";

import { isArray } from "@auaust/toolkit";
import { keys, record } from "@auaust/toolkit/object";

import { invocationSeparator } from "#nexus/cli/constants";
import { CommandUsageError } from "#nexus/cli/errors/CommandUsageError";
import { describeOptionFlags } from "#nexus/cli/operations/describeOptionFlags";
import { parseUsageValue } from "#nexus/cli/operations/parseUsageValue";
import { suggestName } from "#nexus/cli/utils/suggestName";
import type { CommandTokens } from "#nexus/cli/types/CommandTokens";
import type { OptionDeclaration } from "#nexus/cli/types/OptionDeclaration";
import type { ParsingCommandDeclaration } from "#nexus/cli/types/ParsingCommandDeclaration";

const reservedOptions = {
  help: { type: "boolean", short: "h" },
  version: { type: "boolean", short: "V" },
} as const satisfies ParseArgsOptionsConfig;

const negativeNumber = /^-(?:\d+|\d*\.\d+)(?:e[+-]?\d+)?$/u;

/** @confined */
function indexOptions(
  declaration: ParsingCommandDeclaration,
  options: readonly OptionDeclaration[],
): ReadonlyMap<string, OptionDeclaration> {
  const known = new Map<string, OptionDeclaration>();

  for (const option of options) {
    if (`--${option.name}` === invocationSeparator) {
      throw new TypeError(
        `The ${declaration.name} command declares the ${invocationSeparator} option, which nexus reserves to separate invocations`,
      );
    }

    if (known.has(option.name) || option.name in reservedOptions) {
      throw new TypeError(
        `The ${declaration.name} command declares the --${option.name} option twice, run and reserved options included`,
      );
    }

    known.set(option.name, option);
  }

  return known;
}

type ParseToken = NonNullable<ReturnType<typeof parseArgs>["tokens"]>[number];

function findNegativeArguments(
  args: readonly string[],
  tokens: readonly ParseToken[],
  known: ReadonlyMap<string, OptionDeclaration>,
): ReadonlySet<number> {
  const numbers = new Set<number>();

  for (const token of tokens) {
    if (
      token.kind === "option" &&
      negativeNumber.test(args[token.index] ?? "") &&
      !isDeclaredFlag(known.get(token.name), token)
    ) {
      numbers.add(token.index);
    }
  }

  return numbers;
}

function isDeclaredFlag(
  option: OptionDeclaration | undefined,
  token: Extract<ParseToken, { kind: "option" }>,
): boolean {
  return (
    option !== undefined &&
    !(option.type === "boolean" && token.inlineValue === true)
  );
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

function suggestOption(
  flag: string,
  declaration: ParsingCommandDeclaration,
  known: ReadonlyMap<string, OptionDeclaration>,
): string {
  return flag.startsWith("--")
    ? suggestName(
        flag,
        keys(createParseConfig(declaration, known)).map((name) => {
          return `--${name}`;
        }),
      )
    : "";
}

/**
 * Parses the tokens `args` holds for one command, with `routing` up to its
 * first positional argument, the name of a subcommand it may route to, unless
 * an unknown option comes first: its own `options` and the `runOptions`, whose
 * values `runValues` collects across the command path, `--help`, and `--version`
 * when it declares one; an unknown option, a missing or invalid value adds a
 * usage error to `errors`.
 *
 * @throws {TypeError} When two options, run and reserved ones included, share a
 * name, or one is named after the `--next` separator.
 * @observing
 */
export function parseCommandTokens(
  declaration: ParsingCommandDeclaration,
  {
    options,
    runOptions,
    runValues,
    routing,
  }: {
    options: readonly OptionDeclaration[];
    runOptions: readonly OptionDeclaration[];
    runValues: Map<OptionDeclaration, unknown>;
    routing: boolean;
  },
  args: readonly string[],
  errors: CommandUsageError[],
): CommandTokens {
  const runs = new Set(runOptions);
  const known = indexOptions(declaration, [...options, ...runOptions]);
  const isGroup = declaration.subcommands.length > 0;
  const given = new Map<OptionDeclaration, unknown>();
  const positionals: string[] = [];

  let blocked = false;

  const { tokens } = parseArgs({
    args: [...args],
    options: createParseConfig(declaration, known),
    strict: false,
    allowPositionals: true,
    tokens: true,
  });

  const numbers = isGroup
    ? new Set<number>()
    : findNegativeArguments(args, tokens, known);

  let lastNumber: number | undefined;

  for (const token of tokens) {
    if (token.kind === "option-terminator") {
      continue;
    }

    if (token.kind === "positional") {
      if (routing && !blocked && positionals.length === 0) {
        return {
          candidate: {
            name: token.value,
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

    if (numbers.has(token.index)) {
      if (lastNumber !== token.index) {
        lastNumber = token.index;
        positionals.push(args[token.index] ?? token.rawName);
      }

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

    if (option === undefined || !isDeclaredFlag(option, token)) {
      const raw = args[token.index] ?? token.rawName;

      errors.push(
        new CommandUsageError(
          token.inlineValue === true
            ? `unknown option '${raw}'`
            : `unknown option '${token.rawName}'${suggestOption(token.rawName, declaration, known)}`,
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

    const items = parseUsageValue(
      {
        invalid(item) {
          return `option '${flags}' argument '${item}' is invalid.`;
        },
        separator: option.separator,
        choices: option.choices,
        parse: option.parse,
      },
      token.value,
      errors,
    );

    if (items === undefined) {
      continue;
    }

    const previous = target.get(option);

    target.set(
      option,
      option.list
        ? [...(option.multiple && isArray(previous) ? previous : []), ...items]
        : items[0],
    );
  }

  return {
    given,
    positionals,
    blocked,
  };
}
