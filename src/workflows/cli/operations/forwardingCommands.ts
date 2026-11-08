import type { CommandUnknownOpts } from "@commander-js/extra-typings";

// @debt module-global registry linking `defineToolCommand` to `createProgram`: the definition contract could carry whether a command forwards its arguments, instead of shared mutable state keyed by Commander instances
export const forwardingCommands = new WeakSet<CommandUnknownOpts>();
