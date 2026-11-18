import { onTestFinished } from "vitest";

import { createTestReporter } from "#tests/utils/createTestReporter";
import { createProgram, type CommandDefinition } from "#workflows/cli/index";
import { runContext } from "#workflows/cli/operations/runContext";

export async function runDefinition(
  definition: CommandDefinition,
  ...args: string[]
): Promise<ReturnType<typeof createTestReporter>> {
  const controller = new AbortController();
  const reporter = createTestReporter();

  onTestFinished(() => {
    controller.abort();
  });

  await runContext.run({ signal: controller.signal, reporter }, () => {
    return createProgram("program", definition).parseAsync(args, {
      from: "user",
    });
  });

  return reporter;
}
