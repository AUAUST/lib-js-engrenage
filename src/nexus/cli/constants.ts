import { freeze } from "@auaust/toolkit/object";

import type { HelpFacts } from "#nexus/cli/types/HelpFacts";
import type { HelpOption } from "#nexus/cli/types/HelpOption";
import type { Verbosity } from "#nexus/reports/index";

export const invocationSeparator = "--next";

export const helpCommandName = "help";

export const helpCommandFacts: HelpFacts = freeze({
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

export const reservedHelpOptions: readonly HelpOption[] = freeze([
  freeze({
    flags: "-h, --help",
    description: "print the contract of every command under the path it follows",
    required: false,
    multiple: false,
    conflicts: freeze([]),
  }),
  freeze({
    flags: invocationSeparator,
    description: `chain another invocation as ${invocationSeparator} <command path> [arguments] [options], run in order in one process; the first failure stops the rest, earlier ones keeping their effects; write --<option>=${invocationSeparator} for the text ${invocationSeparator}`,
    required: false,
    multiple: true,
    conflicts: freeze([]),
  }),
]);

export const versionHelpOption: HelpOption = freeze({
  flags: "-V, --version",
  description: "print the version",
  required: false,
  multiple: false,
  conflicts: freeze([]),
});

export const verbosityFlags = {
  silent: "silent",
  quiet: "important",
  verbose: "info",
  debug: "debug",
} as const satisfies Record<string, Verbosity>;

export const runPhases = {
  startup: "startup",
  routing: "routing",
  sources: "source loading",
  layers: "layer loading",
  validation: "validation",
  action: "action loading",
  execution: "execution",
} as const;

export const phaseSeparator = ":";
