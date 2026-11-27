import type { CommandUnknownOpts } from "@commander-js/extra-typings";

import { keys } from "@auaust/toolkit/object";

import { verbosityFlags } from "#nexus/cli/constants";
import type { VerbosityFlag } from "#nexus/cli/types/VerbosityFlag";

function isFlagSet(command: CommandUnknownOpts | null, flag: VerbosityFlag) {
  for (let current = command; current !== null; current = current.parent) {
    if (current.getOptionValue(flag) === true) {
      return true;
    }
  }

  return false;
}

/**
 * Lists the verbosity flags set on `command` or its ancestors, least
 * verbose first.
 */
export function listVerbosityFlags(
  command: CommandUnknownOpts | null,
): readonly VerbosityFlag[] {
  return keys(verbosityFlags).filter((flag) => {
    return isFlagSet(command, flag);
  });
}
