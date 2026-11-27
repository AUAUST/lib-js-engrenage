import { freeze } from "@auaust/toolkit/object";

import type { HelpFacts } from "#nexus/cli/types/HelpFacts";
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
