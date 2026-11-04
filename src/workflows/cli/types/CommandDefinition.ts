import type { Command, CommandUnknownOpts } from "@commander-js/extra-typings";

export type CommandDefinition = (command: Command) => CommandUnknownOpts;
