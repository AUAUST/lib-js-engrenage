import type { CommandUnknownOpts } from "@commander-js/extra-typings";

export type ExtendModule =
  | ((command: CommandUnknownOpts) => void | Promise<void>)
  | { default(command: CommandUnknownOpts): void | Promise<void> };
