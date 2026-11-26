import type { CommandUnknownOpts } from "@commander-js/extra-typings";

export function addRunOptions(command: CommandUnknownOpts): void {
  command.option("--debug", "print the stack trace of errors");
  command.option("--verbose", "print progress and details");
}
