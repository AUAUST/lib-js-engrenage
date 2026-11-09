import { describe, expect, test } from "vitest";

import { createProjectConfig } from "#project/config/index";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";

describe("agents.preferred", () => {
  test("fails on a name no active runtime contributes, naming the active ones", async () => {
    const config = createProjectConfig({
      root: createTemporaryProject().root,
      raw: {
        agents: { preferred: ["cursor"] },
      },
      configFile: undefined,
    });

    await expect(config.resolve("agents")).rejects.toThrow(
      "agents.preferred lists cursor, which no active agent runtime contributes; active runtimes: claude, codex",
    );
  });
});
