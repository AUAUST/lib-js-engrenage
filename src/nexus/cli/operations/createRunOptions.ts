import { keys } from "@auaust/toolkit/object";

import { verbosityFlags } from "#nexus/cli/constants";
import { option } from "#nexus/cli/operations/option";
import type { VerbosityFlag } from "#nexus/cli/types/VerbosityFlag";

function listOthers(flag: VerbosityFlag): VerbosityFlag[] {
  return keys(verbosityFlags).filter((other) => other !== flag);
}

/**
 * Declares the run options every command of a program but a forwarding one
 * accepts: the verbosity flags, each conflicting with the others, and `--output`
 * naming one of `scenarios`.
 *
 * @pure
 */
export function createRunOptions(scenarios: readonly string[]) {
  return [
    option({
      name: "silent",
      type: "boolean",
      description: "print nothing; the exit code carries the outcome",
      conflicts: listOthers("silent"),
    }),
    option({
      name: "quiet",
      type: "boolean",
      description: "print only errors, warnings and the completion line",
      conflicts: listOthers("quiet"),
    }),
    option({
      name: "verbose",
      type: "boolean",
      description: "also print progress and details",
      conflicts: listOthers("verbose"),
    }),
    option({
      name: "debug",
      type: "boolean",
      description: "also print debugging details, stack traces included",
      conflicts: listOthers("debug"),
    }),
    option({
      name: "output",
      type: "string",
      description: "print for the output scenario <scenario> instead of the detected one",
      placeholder: "scenario",
      choices: scenarios,
    }),
  ] as const;
}
