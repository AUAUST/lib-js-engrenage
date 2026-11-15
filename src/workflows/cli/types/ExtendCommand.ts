import type { CommandUnknownOpts } from "@commander-js/extra-typings";

export type ExtendCommand = (
  command: CommandUnknownOpts,
) => void | Promise<void>;
