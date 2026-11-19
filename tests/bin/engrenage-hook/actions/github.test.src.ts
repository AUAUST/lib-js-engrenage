import { afterEach, expect, test, vi } from "vitest";

import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { createTestReporter } from "#tests/utils/createTestReporter";
import { runContext } from "#workflows/cli/operations/runContext";

import github from "#bin/engrenage-hook/actions/github";

afterEach(() => {
  vi.restoreAllMocks();
});

test("loads the config of the project holding a shell inside a dependency", async () => {
  const dependency = "node_modules/.pnpm/x/node_modules/@auaust/engrenage";

  const project = createTemporaryProject({
    "package.json": '{"type":"module"}',
    "engrenage.config.ts": "export default {};",
    [`${dependency}/package.json`]: '{"type":"module"}',
    [`${dependency}/engrenage.config.ts`]: "export default { unknown: true };",
  });

  const write = vi.spyOn(process.stdout, "write").mockReturnValue(true);

  const denied = await runContext.run(
    { signal: new AbortController().signal, reporter: createTestReporter() },
    () => {
      return github(
        {
          cwd: project.resolve(dependency),
          tool_input: { command: "gh issue create --title x" },
        },
        "Claude Code",
      );
    },
  );

  expect(denied).toBe(true);

  expect(write).toHaveBeenCalledWith(
    expect.stringContaining("create issues as drafts"),
  );
});
