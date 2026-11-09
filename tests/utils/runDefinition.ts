import { onTestFinished } from "vitest";

import { createProgram, type CommandDefinition } from "#workflows/cli/index";
import { runContext } from "#workflows/cli/operations/runContext";

export async function runDefinition(
  definition: CommandDefinition,
  ...args: string[]
) {
  const controller = new AbortController();

  onTestFinished(() => {
    controller.abort();
  });

  await runContext.run({ signal: controller.signal }, () =>
    createProgram("program", definition).parseAsync(args, {
      from: "user",
    }),
  );
}
