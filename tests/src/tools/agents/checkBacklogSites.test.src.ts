import { describe, expect, test } from "vitest";

import { loadConfig } from "#project/config/operations/loadConfig";
import { runSync } from "#project/sync/index";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { createTestReporter } from "#tests/utils/createTestReporter";

async function check(sites: string) {
  const project = createTemporaryProject({
    "package.json": JSON.stringify({ type: "module", name: "project" }),
    "engrenage.config.ts": 'export default { runtime: { node: 24 }, agents: { preferred: ["claude"] } };',
    "eslint.config.ts": "",
    "src/index.ts": "",
    "src/a.ts": "",
    "src/b.ts": "",
    ".ai/backlog/index.md": "# Backlog\n",
    ".ai/backlog/tools.md": `# Tools\n\n## T1. Entry\n\n${sites}\n- why: reason\n`,
  });

  const loaded = await loadConfig(project.root, {
    reporter: createTestReporter(),
  });

  const [failure] = await runSync(loaded, { names: ["backlog-sites"] });

  if (failure !== undefined) {
    throw failure.error;
  }
}

describe("checkBacklogSites", () => {
  test("passes on file:line code spans joined by commas", async () => {
    await expect(
      check("- sites: `src/a.ts:3`, `src/b.ts:10`"),
    ).resolves.toBeUndefined();
  });

  test("fails on a shorthand site, naming the bullet's line", async () => {
    await expect(check("- sites: `src/a.ts:3`, `:7`")).rejects.toThrow(
      ".ai/backlog/tools.md:5:",
    );
  });

  test("passes on a root file site", async () => {
    await expect(
      check("- sites: `eslint.config.ts:1`"),
    ).resolves.toBeUndefined();
  });

  test("fails on a site whose path names no file", async () => {
    await expect(check("- sites: `src/a.ts:3`, `b.ts:22`")).rejects.toThrow(
      ".ai/backlog/tools.md:5: site `b.ts` names no file",
    );
  });
});
