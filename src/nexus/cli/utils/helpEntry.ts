import { isString } from "@auaust/toolkit";
import { join } from "@auaust/toolkit/array";

import { invocationSeparator } from "#nexus/cli/constants";
import {
  dataEntry,
  lineEntry,
  styled,
  tableEntry,
  titleEntry,
  type DataEntry,
  type ReportContent,
  type ReportSpan,
  type TableRow,
} from "#nexus/reports/index";
import type { CommandPath } from "#nexus/cli/types/CommandPath";
import type { HelpArgument } from "#nexus/cli/types/HelpArgument";
import type { HelpContract } from "#nexus/cli/types/HelpContract";
import type { HelpFacts } from "#nexus/cli/types/HelpFacts";
import type { HelpListing } from "#nexus/cli/types/HelpListing";
import type { HelpOption } from "#nexus/cli/types/HelpOption";

const columns = [{ align: "start" }, { align: "start" }] as const;

function findVariedIndex(
  first: CommandPath,
  other: CommandPath,
): number | undefined {
  if (first.length !== other.length) {
    return;
  }

  const varied = [...first.keys()].filter((index) => {
    return first[index] !== other[index];
  });

  return varied.length === 1 ? varied[0] : undefined;
}

/**
 * Writes `first` with the names the `others` of its length differing from
 * it at one same index hold there, in brace notation, adding each one it
 * writes to `written`.
 *
 * @confined
 */
function describeVariants(
  first: CommandPath,
  others: readonly CommandPath[],
  written: Set<CommandPath>,
): string {
  const names: string[] = [];

  let varied: number | undefined;

  for (const other of others) {
    const index = findVariedIndex(first, other);

    if (
      written.has(other) ||
      index === undefined ||
      (varied !== undefined && index !== varied)
    ) {
      continue;
    }

    varied = index;

    names.push(other[index] ?? "");
    written.add(other);
  }

  const shown = [...first];

  if (varied !== undefined) {
    shown[varied] = `{${join([first[varied] ?? "", ...names], ",")}}`;
  }

  return join(shown, " ");
}

/**
 * Writes `paths` in brace notation, paths differing by one name sharing one part,
 * such as `{friction,missing} add`.
 *
 * @pure
 */
function describePaths(paths: readonly CommandPath[]): string {
  const written = new Set<CommandPath>();

  const parts: string[] = [];

  for (const path of paths) {
    if (written.has(path)) {
      continue;
    }

    written.add(path);
    parts.push(describeVariants(path, paths, written));
  }

  return join(parts, ", ");
}

function describeRules(rules: readonly (string | false | undefined)[]): string {
  const shown = rules.filter(isString);

  return shown.length === 0 ? "" : ` (${join(shown, "; ")})`;
}

function describeChoices(
  choices: readonly string[] | undefined,
): string | undefined {
  return choices === undefined ? undefined : `choices: ${join(choices, ", ")}`;
}

function describeSeparator(separator: string | undefined): string | undefined {
  return separator === undefined
    ? undefined
    : `separated by ${JSON.stringify(separator)}`;
}

function optionRow(option: HelpOption, depth: number): TableRow {
  return {
    cells: [
      option.flags,
      `${option.description ?? ""}${describeRules([
        option.required && "required",
        option.multiple && "repeatable",
        describeSeparator(option.separator),
        option.default !== undefined && `default: ${option.default}`,
        describeChoices(option.choices),
        option.conflicts.length > 0 &&
          `conflicts: ${join(option.conflicts, ", ")}`,
      ])}`.trim(),
    ],
    depth,
  };
}

function argumentRow(argument: HelpArgument, depth: number): TableRow {
  return {
    cells: [
      argument.usage,
      `${argument.description ?? ""}${describeRules([
        describeSeparator(argument.separator),
        describeChoices(argument.choices),
      ])}`.trim(),
    ],
    depth,
  };
}

function factRows(facts: HelpFacts, depth: number): TableRow[] {
  return [
    ...(facts.aliases.length > 0
      ? [{ cells: ["aliases", join(facts.aliases, ", ")], depth }]
      : []),
    ...facts.arguments.map((argument) => argumentRow(argument, depth)),
    ...facts.options.map((option) => optionRow(option, depth)),
    ...(facts.subcommands.length > 0
      ? [{ cells: ["commands", join(facts.subcommands, ", ")], depth }]
      : []),
  ];
}

function afterRows({ after }: HelpFacts, depth: number): TableRow[] {
  return after === undefined ? [] : [{ cells: ["", after], depth }];
}

function describeTitle(
  { paths, usage, description, kind, chains }: HelpListing,
  program: string,
): ReportSpan[] {
  const named = paths.map((path) => {
    return path.length === 0 ? [program] : path;
  });

  return [
    styled("command", describePaths(named)),
    ...(usage === "" ? [] : [` ${usage}`]),
    ...(description === undefined ? [] : ["  ", styled("muted", description)]),
    ...(chains ? ["  ", styled("muted", "(chains)")] : []),
    ...(kind === "forwarding"
      ? [
          "  ",
          styled(
            "muted",
            "(passes every argument after its name as given, --help included; takes no run options)",
          ),
        ]
      : []),
  ];
}

function listingEntry(listing: HelpListing, program: string): ReportContent {
  const rows = [
    ...factRows({ ...listing, aliases: [] }, 0),
    ...afterRows(listing, 0),
    ...listing.mounts.flatMap(({ paths, description = "", ...facts }) => {
      return [
        { cells: [`${describePaths(paths)}:`, description] },
        ...factRows(facts, 1),
        ...afterRows(facts, 1),
      ];
    }),
  ];

  const aliases = listing.aliases.length > 0
    ? [styled("muted", ` (aliases: ${join(listing.aliases, ", ")})`)]
    : [];

  const title = [...describeTitle(listing, program), ...aliases];

  return rows.length === 0
    ? titleEntry(title)
    : tableEntry({
        title,
        columns,
        rows,
      });
}

/**
 * The entry reporting `contract`, a program's help: its value for machines, and
 * for people and agents the usage line, the run options, `--next` and the reserved
 * flags among them, the chaining syntax when a listed command chains, then each
 * listing, a chaining one marked so, with its paths in brace notation, its usage,
 * arguments and options, and below each mount's paths what only they state.
 *
 * @pure
 */
export function helpEntry(contract: HelpContract): DataEntry {
  const { program, runOptions, listings } = contract;

  const chains = listings.some((listing) => listing.chains);

  return dataEntry(contract, [
    lineEntry(
      `Usage: ${program} [run options] <command path> [arguments] [options]. <name> is required, [name] optional, name... repeatable; an option applies to the command it follows, a run option to any.`,
    ),
    tableEntry({
      title: "Run options",
      columns,
      rows: runOptions.map((option) => optionRow(option, 0)),
    }),
    ...(chains
      ? [
          lineEntry(
            `Chaining: <command path> <arguments> ${invocationSeparator} <command path> <arguments> ... runs several invocations of one command marked (chains), each naming its full command path and taking its own arguments and options; nothing takes effect unless every invocation succeeds.`,
          ),
        ]
      : []),
    ...listings.map((listing) => listingEntry(listing, program)),
  ]);
}
