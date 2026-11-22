import { expect, test } from "vitest";

import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { guardClaudeGithub } from "#tools/metalbrain/operations/guardClaudeGithub";

test("loads the config of the project holding a shell inside a dependency", async () => {
  const dependency = "node_modules/.pnpm/x/node_modules/@auaust/engrenage";

  const project = createTemporaryProject({
    "package.json": '{"type":"module"}',
    "engrenage.config.ts": "export default {};",
    [`${dependency}/package.json`]: '{"type":"module"}',
    [`${dependency}/engrenage.config.ts`]: "export default { unknown: true };",
  });

  const verdict = await guardClaudeGithub({
    cwd: project.resolve(dependency),
    tool_input: { command: "gh issue create --title x" },
  });

  expect(verdict).toEqual({
    decision: "deny",
    reason: expect.stringContaining("create issues as drafts"),
  });
});
