import { onTestFinished } from "vitest";

import { createProgram, type CommandDeclaration } from "#nexus/cli/index";
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

  await runContext.run({ signal: controller.signal, reporter }, () => {
    return createProgram(declaration).parseAsync(args, { from: "user" });
  });

  return reporter;
}
