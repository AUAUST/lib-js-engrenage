import type { CommandUnknownOpts } from "@commander-js/extra-typings";

// @debt repeats the run options createRunOptions declares, until programs leave Commander
export function addRunOptions(command: CommandUnknownOpts): void {
  command.option(
    "--silent",
    "print nothing; the exit code carries the outcome",
  );

  command.option(
    "--quiet",
    "print only errors, warnings and the completion line",
  );

  command.option("--verbose", "also print progress and details");

  command.option(
    "--debug",
    "also print debugging details, stack traces included",
  );

  command.option(
    "--output <scenario>",
    "print for the output scenario <scenario> instead of the detected one",
  );
}
