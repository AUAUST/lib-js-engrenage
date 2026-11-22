import { describe, expect, test } from "vitest";

import { loadConfig } from "#project/config/operations/loadConfig";
import { runSync } from "#project/sync/index";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { createTestReporter } from "#tests/utils/createTestReporter";

const category = "purpose: Tools.\nentries:\n";

async function check(entries: string) {
  const project = createTemporaryProject({
    "package.json": JSON.stringify({ type: "module", name: "project" }),
    "engrenage.config.ts": 'export default { runtime: { node: 24 }, agents: { preferred: ["claude"] } };',
    "src/index.ts": "",
    "src/a.ts": "",
    ".ai/backlog/tools.yml": `${category}${entries}`,
  });

  const loaded = await loadConfig(project.root, {
    reporter: createTestReporter(),
  });

  const [failure] = await runSync(loaded, { names: ["backlog"] });

  if (failure !== undefined) {
    throw failure.error;
  }
}

describe("checkBacklog", () => {
  test("passes an entry matching the backlog file schema", async () => {
    await expect(
      check(
        "  - id: 261122-3fa9\n    title: A claim\n    sites: [src/a.ts:3]\n    why: reason\n    want: [one, two]\n",
      ),
    ).resolves.toBeUndefined();
  });

  test("names both the excess details and the unknown key", async () => {
    const failure = check(
      "  - id: 261122-3fa9\n    title: A claim\n    why: reason\n    want: [one, two]\n    done: end\n    note: extra\n",
    );

    await expect(failure).rejects.toThrow(
      ".ai/backlog/tools.yml: entry 261122-3fa9: 4 why, want and done items, over 3",
    );

    await expect(failure).rejects.toThrow('unknown key "note"');
  });

  test("fails on a site naming no file", async () => {
    await expect(
      check(
        "  - id: 261122-3fa9\n    title: A claim\n    sites: [src/b.ts:3]\n",
      ),
    ).rejects.toThrow("site `src/b.ts` names no file");
  });

  test("fails on an entry over its word cap", async () => {
    const words = Array.from({ length: 120 }, () => "word").join(" ");

    await expect(
      check(`  - id: 261122-3fa9\n    title: A claim\n    why: ${words}\n`),
    ).rejects.toThrow("words, over the backlogEntry word cap of 100");
  });
});
