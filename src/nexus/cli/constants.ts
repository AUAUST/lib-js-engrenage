import type { Verbosity } from "#nexus/reports/index";

export const commandRegistration = Symbol.for(
  "@auaust/nexus/cli/commandRegistration",
);

export const commandExtension = Symbol.for(
  "@auaust/nexus/cli/commandExtension",
);

export const commandForwarding = Symbol.for(
  "@auaust/nexus/cli/commandForwarding",
);

export const invocationSeparator = "--next";

export const verbosityFlags = {
  silent: "silent",
  quiet: "important",
  verbose: "info",
  debug: "debug",
} as const satisfies Record<string, Verbosity>;
