import { readFile } from "node:fs/promises";

import { describe, expect, test } from "vitest";

import { resolveDataFile } from "#foundation/data/index";
import { loadConfig } from "#project/config/operations/loadConfig";
import { collectChanges, runSync } from "#project/sync/index";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { createTestReporter } from "#tests/utils/createTestReporter";
import { linkSourcePackage } from "#tests/utils/linkSourcePackage";
import { backlogIndex, backlogTemplate } from "#tools/agents/constants";

function createProject(index: string) {
  const project = createTemporaryProject({
    "package.json": '{"type":"module"}',
    "engrenage.config.ts": 'export default { agents: { preferred: ["claude"] } };',
    "AGENTS.md": "# Agents\n",
    [backlogIndex]: index,
  });

  linkSourcePackage(project.resolve("node_modules/@auaust/engrenage"));

  return project;
}

async function sync(root: string) {
  const config = await loadConfig(root, { reporter: createTestReporter() });

  await runSync(config);

  await config.context.filesystem.flush();
}

describe("migrateBacklogIndex", () => {
  test("replaces the inline instructions with the template block", async () => {
    const project = createProject(
      [
        "# Backlog",
        "",
        "Deferred work.",
        "",
        "## Entries",
        "",
        "- An outdated rule.",
        "",
        "## Open categories",
        "",
        "- [toolkit](toolkit.md): Upstream toolkit decisions.",
        "",
      ].join("\n"),
    );

    await sync(project.root);

    const index = project.read(backlogIndex);

    const template = await readFile(resolveDataFile(backlogTemplate), "utf-8");

    expect(index).toContain(template.trim());
    expect(index).not.toContain("An outdated rule.");

    expect(index).toContain(
      "## Open categories\n\n- [toolkit](toolkit.md): Upstream toolkit decisions.\n",
    );

    const changes = await collectChanges(
      await loadConfig(project.root, { reporter: createTestReporter() }),
      {
        check: true,
      },
    );

    expect(changes.filter(({ file }) => file === backlogIndex)).toEqual([]);
  });

  test("fails on an index without the categories heading", async () => {
    const project = createProject("# Backlog\n\nDeferred work.\n");

    await expect(sync(project.root)).rejects.toThrow('"## Open categories"');
  });
});
