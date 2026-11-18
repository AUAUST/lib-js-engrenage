import { runContext } from "#workflows/cli/operations/runContext";
import type { RunContext } from "#workflows/cli/types/RunContext";

export function getRunContext(): RunContext {
  const context = runContext.getStore();

  if (context === undefined) {
    throw new Error("Commands run only within runProgram");
  }

  return context;
}
