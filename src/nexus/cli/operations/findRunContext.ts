import { runContext } from "#nexus/cli/operations/runContext";
import type { RunContext } from "#nexus/cli/types/RunContext";

/**
 * The context of the program run the caller runs within, or `undefined`
 * outside any run.
 */
export function findRunContext(): RunContext | undefined {
  return runContext.getStore();
}
