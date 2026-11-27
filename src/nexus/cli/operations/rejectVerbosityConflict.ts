import type { CommandUnknownOpts } from "@commander-js/extra-typings";

import { CommandUsageError } from "#nexus/cli/errors/CommandUsageError";
import { listVerbosityFlags } from "#nexus/cli/operations/listVerbosityFlags";

/**
 * @throws {CommandUsageError} when `command` and its ancestors set more than
 * one verbosity flag.
 */
export function rejectVerbosityConflict(command: CommandUnknownOpts): void {
  const [first, second] = listVerbosityFlags(command);

  if (first !== undefined && second !== undefined) {
    throw new CommandUsageError(
      `option '--${first}' cannot be used with option '--${second}'`,
    );
  }
}
