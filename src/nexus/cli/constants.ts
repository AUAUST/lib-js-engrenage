import type { Verbosity } from "#nexus/reports/index";

export const invocationSeparator = "--next";

export const helpCommandName = "help";

export const verbosityFlags = {
  silent: "silent",
  quiet: "important",
  verbose: "info",
  debug: "debug",
} as const satisfies Record<string, Verbosity>;

export const runPhases = {
  startup: "startup",
  routing: "routing",
  layers: "layer loading",
  validation: "validation",
  action: "action loading",
  execution: "execution",
} as const;

export const phaseSeparator = ":";
