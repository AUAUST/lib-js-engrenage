import { runContext } from "#workflows/cli/operations/runContext";
import type { RunContext } from "#workflows/cli/types/RunContext";

// @debt Every bin and scripts action repeats `loadValidatedConfig(…, { reporter: getRunContext().reporter })`; a run-scoped config loader here would own it.
export function getRunContext(): RunContext {
  const context = runContext.getStore();

  if (context === undefined) {
    throw new Error("Commands run only within runProgram");
  }

  return context;
}
