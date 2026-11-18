import { afterEach, expect, test, vi } from "vitest";

import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { mockCwd } from "#tests/utils/mockCwd";
import { runDefinition } from "#tests/utils/runDefinition";

import check from "#bin/engrenage/agents/check";

afterEach(() => {
  vi.restoreAllMocks();
  process.exitCode = undefined;
});

test("logs a configured finding without --verbose", async () => {
  mockCwd(
    createTemporaryProject({
      "package.json": "{}",
      "engrenage.config.ts": 'export default { agents: { preferred: ["claude"] } };',
      "AGENTS.md": "",
    }).root,
  );

  const { messages } = await runDefinition(check);

  expect(messages).toContainEqual({
    level: "log",
    text: "claude · configured · AGENTS.md: present",
    data: undefined,
  });
});
