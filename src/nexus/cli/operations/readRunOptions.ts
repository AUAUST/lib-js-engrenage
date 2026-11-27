import { isString } from "@auaust/toolkit";
import { freeze } from "@auaust/toolkit/object";

import type { createRunOptions } from "#nexus/cli/operations/createRunOptions";
import type { OptionDeclaration } from "#nexus/cli/types/OptionDeclaration";
import type { RunOptionValues } from "#nexus/cli/types/RunOptionValues";

/**
 * Reads the value of each of `runOptions` that `values` holds.
 *
 * @pure
 */
export function readRunOptions(
  [silent, quiet, verbose, debug, output, timings]: ReturnType<
    typeof createRunOptions
  >,
  values: ReadonlyMap<OptionDeclaration, unknown>,
): RunOptionValues {
  const scenario = values.get(output);

  return freeze({
    silent: values.has(silent) ? true : undefined,
    quiet: values.has(quiet) ? true : undefined,
    verbose: values.has(verbose) ? true : undefined,
    debug: values.has(debug) ? true : undefined,
    output: isString(scenario) ? scenario : undefined,
    timings: values.has(timings) ? true : undefined,
  });
}
