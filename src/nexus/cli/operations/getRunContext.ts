import { findRunContext } from "#nexus/cli/operations/findRunContext";
import type { RunContext } from "#nexus/cli/types/RunContext";

// @debt Every bin and scripts action repeats `loadValidatedConfig(…, { reporter: getRunContext().reporter })`; a run-scoped config loader here would own it.
/**
 * The context of the program run the caller runs within.
 *
 * @throws {Error} When called outside any program run.
 */
export function getRunContext(): RunContext {
  const context = findRunContext();

  if (context === undefined) {
    throw new Error("Commands run only within runProgram");
  }

  return context;
}
