import { isArray, isFunction } from "@auaust/toolkit";
import { freeze, keys } from "@auaust/toolkit/object";

import { helpCommandName, invocationSeparator } from "#nexus/cli/constants";
import { createRunOptions } from "#nexus/cli/operations/createRunOptions";
import { describeOptionFlags } from "#nexus/cli/operations/describeOptionFlags";
import { loadCommandLayer } from "#nexus/cli/operations/loadCommandLayer";
import { splitHelpFacts } from "#nexus/cli/utils/splitHelpFacts";
import type { ArgumentDeclaration } from "#nexus/cli/types/ArgumentDeclaration";
import type { CommandDeclaration } from "#nexus/cli/types/CommandDeclaration";
import type { CommandPath } from "#nexus/cli/types/CommandPath";
import type { HelpArgument } from "#nexus/cli/types/HelpArgument";
import type { HelpContract } from "#nexus/cli/types/HelpContract";
import type { HelpFacts } from "#nexus/cli/types/HelpFacts";
import type { HelpListing } from "#nexus/cli/types/HelpListing";
import type { HelpOption } from "#nexus/cli/types/HelpOption";
import type { OptionDeclaration } from "#nexus/cli/types/OptionDeclaration";
import type { ParsingCommandDeclaration } from "#nexus/cli/types/ParsingCommandDeclaration";
import type { ProgramDeclaration } from "#nexus/cli/types/ProgramDeclaration";

interface Mounted {
  readonly declaration: CommandDeclaration;
  readonly path: CommandPath;
}

const helpCommandFacts: HelpFacts = freeze({
  description: "print the contract of every command under <path>, the whole program without one",
  aliases: freeze([]),
  arguments: freeze([
    freeze({
      usage: "[path...]",
      description: "the names of a command path",
      optional: true,
      variadic: true,
    }),
  ]),
  options: freeze([]),
  subcommands: freeze([]),
});

function describeOption(option: OptionDeclaration): HelpOption {
  const shown = option.default !== undefined && option.default !== false;

  return freeze({
    flags: describeOptionFlags(option),
    ...(option.description !== undefined && {
      description: option.description,
    }),
    required: option.required,
    multiple: option.multiple,
    ...(shown && { default: JSON.stringify(option.default) }),
    ...(option.choices !== undefined && { choices: option.choices }),
    conflicts: freeze(
      option.conflicts.map((name) => {
        return `--${name}`;
      }),
    ),
  });
}

function describeArgumentUsage({
  name,
  optional,
  variadic,
}: ArgumentDeclaration): string {
  const shown = variadic ? `${name}...` : name;

  return optional ? `[${shown}]` : `<${shown}>`;
}

function describeUsage(declaration: CommandDeclaration): string {
  if (declaration.kind === "forwarding") {
    return "[arguments...]";
  }

  const parts = [
    ...(declaration.subcommands.length === 0
      ? []
      : [declaration.action === undefined ? "<command>" : "[command]"]),
    ...declaration.arguments.map(describeArgumentUsage),
    ...(declaration.options.length > 0 ? ["[options]"] : []),
  ];

  return parts.join(" ");
}

function isFoldable(declaration: CommandDeclaration): boolean {
  return (
    declaration.kind === "parsing" &&
    declaration.action === undefined &&
    declaration.subcommands.length > 0
  );
}

function holdsAll(
  holder: ParsingCommandDeclaration,
  held: ParsingCommandDeclaration,
): boolean {
  return held.subcommands.every((subcommand) => {
    return holder.subcommands.includes(subcommand);
  });
}

/**
 * Sorts the subcommands of a group into listings: each its own, but sibling
 * groups without an action whose subcommands one holds all of the other's.
 *
 * @confined
 */
function foldSiblings({
  subcommands,
}: ParsingCommandDeclaration): CommandDeclaration[][] {
  const listings: CommandDeclaration[][] = [];

  for (const subcommand of subcommands) {
    const listing = isFoldable(subcommand)
      ? listings.find((members) => {
          return members.some((member) => {
            return (
              member.kind === "parsing" &&
              subcommand.kind === "parsing" &&
              isFoldable(member) &&
              (holdsAll(member, subcommand) || holdsAll(subcommand, member))
            );
          });
        })
      : undefined;

    if (listing === undefined) {
      listings.push([subcommand]);
    } else {
      listing.push(subcommand);
    }
  }

  return listings;
}

/**
 * Walks the commands under `declaration` at `path`, depth first, listing each
 * declaration once at every path mounting it, sibling groups folded.
 *
 * @confined
 */
function collectListings(
  declaration: CommandDeclaration,
  path: CommandPath,
): Mounted[][] {
  const listings: Mounted[][] = [[{ declaration, path }]];
  const owners = new Map<CommandDeclaration, Mounted[]>();

  function visit(parent: CommandDeclaration, parentPath: CommandPath) {
    if (parent.kind !== "parsing") {
      return;
    }

    for (const members of foldSiblings(parent)) {
      const listing = (
        members
          .map((member) => {
            return owners.get(member);
          })
          .find((owned) => {
            return owned !== undefined;
          }) ?? []
      );

      if (listing.length === 0) {
        listings.push(listing);
      }

      for (const member of members) {
        const memberPath = freeze([...parentPath, member.name]);

        owners.set(member, listing);
        listing.push({ declaration: member, path: memberPath });

        visit(member, memberPath);
      }
    }
  }

  visit(declaration, path);

  return listings;
}

async function loadFacts(
  { declaration, path }: Mounted,
  isRoot: boolean,
): Promise<HelpFacts> {
  const { name, description, aliases } = declaration;

  if (declaration.kind === "forwarding") {
    return freeze({
      ...(description !== undefined && { description }),
      aliases,
      arguments: freeze([]),
      options: freeze([]),
      subcommands: freeze([]),
    });
  }

  const [options, choices, after] = await Promise.all([
    Promise.all(
      declaration.options.map((entry) => {
        return isFunction(entry)
          ? loadCommandLayer(entry, path, name, "options")
          : [entry];
      }),
    ),
    Promise.all(
      declaration.arguments.map((argument) => {
        return isFunction(argument.choices)
          ? loadCommandLayer(argument.choices, path, name, "choices")
          : argument.choices;
      }),
    ),
    isFunction(declaration.help.after)
      ? loadCommandLayer(declaration.help.after, path, name, "help")
      : declaration.help.after,
  ]);

  return freeze({
    ...(description !== undefined && { description }),
    aliases,
    arguments: freeze(
      declaration.arguments.map((argument, index): HelpArgument => {
        const listed = choices[index];

        return freeze({
          usage: describeArgumentUsage(argument),
          ...(argument.description !== undefined && {
            description: argument.description,
          }),
          optional: argument.optional,
          variadic: argument.variadic,
          ...(isArray(listed) && { choices: listed }),
        });
      }),
    ),
    options: freeze(options.flat().map(describeOption)),
    subcommands: freeze([
      ...declaration.subcommands.map((subcommand) => {
        return subcommand.name;
      }),
      ...(isRoot ? [helpCommandName] : []),
    ]),
    ...(after !== undefined && { after }),
  });
}

function readKind({ declaration }: Mounted): HelpListing["kind"] {
  if (declaration.kind === "forwarding") {
    return "forwarding";
  }

  return declaration.subcommands.length > 0 ? "group" : "command";
}

/**
 * Describes the contract of every command under the command `declaration` at
 * `path` of `program`, from their declarations, the layers each loads at each of
 * its paths and the program's run options, loading no action: each declaration
 * listed once with every path mounting it, sibling groups mounting the same
 * commands folded into one listing, and nexus's `help` command listed last when
 * `path` is the program's root.
 */
export async function describeHelp(
  program: ProgramDeclaration,
  { path, declaration }: { path: CommandPath; declaration: CommandDeclaration },
): Promise<HelpContract> {
  const isRoot = path.length === 0 && isFoldable(declaration);

  const listings = await Promise.all(
    collectListings(declaration, path).map(
      async (members): Promise<HelpListing> => {
        const [first] = members;

        if (first === undefined) {
          throw new Error("A help listing holds no command");
        }

        const all = await Promise.all(
          members.map((member) => {
            return loadFacts(member, isRoot && member.path.length === 0);
          }),
        );

        const paths = freeze(
          members.map((member) => {
            return member.path;
          }),
        );

        return freeze({
          paths,
          kind: readKind(first),
          usage: describeUsage(first.declaration),
          chains: (
            first.declaration.kind === "parsing" && first.declaration.chain
          ),
          ...splitHelpFacts(paths, all),
        });
      },
    ),
  );

  const reserved: HelpOption[] = [
    {
      flags: "-h, --help",
      description: "print the contract of every command under the path it follows",
      required: false,
      multiple: false,
      conflicts: [],
    },
    {
      flags: invocationSeparator,
      description: `start another invocation, naming its full command path; write --<option>=${invocationSeparator} for the text ${invocationSeparator}`,
      required: false,
      multiple: true,
      conflicts: [],
    },
    ...(program.root.kind === "parsing" && program.root.version !== undefined
      ? [
          {
            flags: "-V, --version",
            description: "print the version",
            required: false,
            multiple: false,
            conflicts: [],
          },
        ]
      : []),
  ];

  return freeze({
    program: program.root.name,
    runOptions: freeze([
      ...createRunOptions(keys(program.scenarios)).map(describeOption),
      ...reserved.map((option) => {
        return freeze(option);
      }),
    ]),
    listings: freeze([
      ...listings,
      ...(isRoot
        ? [
            freeze({
              ...helpCommandFacts,
              paths: freeze([freeze([helpCommandName])]),
              kind: "command" as const,
              usage: "[path...]",
              chains: false,
              mounts: freeze([]),
            }),
          ]
        : []),
    ]),
  });
}
