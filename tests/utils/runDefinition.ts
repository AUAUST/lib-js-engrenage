import { onTestFinished } from "vitest";

import { program, type CommandDeclaration } from "#nexus/cli/index";
import { executeProgram } from "#nexus/cli/operations/executeProgram";
import { resolveRun } from "#nexus/cli/operations/resolveRun";
import { runContext } from "#nexus/cli/operations/runContext";
import { createTestReporter } from "#tests/utils/createTestReporter";

export async function runDefinition(
  declaration: CommandDeclaration,
  ...args: string[]
): Promise<ReturnType<typeof createTestReporter>> {
  const controller = new AbortController();
  const reporter = createTestReporter();

  onTestFinished(() => {
    controller.abort();
  });

  const declared = program({ root: declaration });

  await runContext.run({ signal: controller.signal, reporter }, async () => {
    const resolution = await resolveRun(declared, args);

    const invocations = resolution.kind === "chain"
      ? resolution.invocations
      : [resolution];

    for (const invocation of invocations) {
      await executeProgram(declared, invocation);
    }
  });

  return reporter;
}
