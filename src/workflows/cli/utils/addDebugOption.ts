import type { CommandUnknownOpts } from "@commander-js/extra-typings";

export function addDebugOption(command: CommandUnknownOpts): void {
  command.option("--debug", "print the stack trace of errors");
}
