import type { Verbosity } from "#nexus/reports/index";

export const invocationSeparator = "--next";

export const helpCommandName = "help";

export const verbosityFlags = {
  silent: "silent",
  quiet: "important",
  verbose: "info",
  debug: "debug",
} as const satisfies Record<string, Verbosity>;
