import { onTestFinished } from "vitest";

import { program, type CommandDeclaration } from "#nexus/cli/index";
import { executeProgram } from "#nexus/cli/operations/executeProgram";
import { runContext } from "#nexus/cli/operations/runContext";
import { createTestReporter } from "#tests/utils/createTestReporter";

function settleNothing(): Promise<void> {
  return Promise.resolve();
}

export async function runDefinition(
  declaration: CommandDeclaration,
  ...args: string[]
): Promise<ReturnType<typeof createTestReporter>> {
  const controller = new AbortController();
  const reporter = createTestReporter();

  onTestFinished(() => {
    controller.abort();
  });

  await runContext.run({ signal: controller.signal, reporter }, () => {
    return executeProgram(program({ root: declaration }), args, settleNothing);
  });

  return reporter;
}
