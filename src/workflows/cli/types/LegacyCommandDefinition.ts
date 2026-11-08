import type { Command, CommandUnknownOpts } from "@commander-js/extra-typings";

export type LegacyCommandDefinition = (command: Command) => CommandUnknownOpts;
