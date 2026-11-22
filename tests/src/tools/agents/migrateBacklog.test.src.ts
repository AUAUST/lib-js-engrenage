import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";

import { describe, expect, test } from "vitest";
import { parse } from "yaml";

import { resolveDataFile } from "#foundation/data/index";
import { backlogIndex } from "#metalbrain/backlog/constants";
import { loadConfig } from "#project/config/operations/loadConfig";
import { collectChanges, runSync } from "#project/sync/index";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { createTestReporter } from "#tests/utils/createTestReporter";
import { linkSourcePackage } from "#tests/utils/linkSourcePackage";
import { backlogTemplate } from "#tools/agents/constants";

function createProject(
  index: string,
  files: Readonly<Record<string, string>> = {},
) {
  const project = createTemporaryProject({
    "package.json": '{"type":"module"}',
    "engrenage.config.ts": 'export default { agents: { preferred: ["claude"] } };',
    "AGENTS.md": "# Agents\n",
    [backlogIndex]: index,
    ...files,
  });

  linkSourcePackage(project.resolve("node_modules/@auaust/engrenage"));

  return project;
}

async function sync(root: string) {
  const config = await loadConfig(root, { reporter: createTestReporter() });

  await runSync(config);

  await config.context.filesystem.flush();
}

describe("backlog migration", () => {
  test("replaces the inline instructions with the template block, the category list with index.yml", async () => {
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
      {
        ".ai/backlog/toolkit.yml": "purpose: Upstream toolkit decisions.\nentries: []\n",
      },
    );

    await sync(project.root);

    const index = project.read(backlogIndex);

    const template = await readFile(resolveDataFile(backlogTemplate), "utf-8");

    expect(index).toContain(template.trim());
    expect(index).not.toContain("An outdated rule.");

    expect(index).not.toContain("## Open categories");

    expect(parse(project.read(".ai/backlog/index.yml"))).toEqual({
      toolkit: { purpose: "Upstream toolkit decisions.", entries: [] },
    });

    const changes = await collectChanges(
      await loadConfig(project.root, { reporter: createTestReporter() }),
      {
        check: true,
      },
    );

    expect(changes.filter(({ file }) => file === backlogIndex)).toEqual([]);
  });

  test("converts a legacy category, rewriting its references, once", async () => {
    const project = createProject(
      "# Backlog\n\n## Open categories\n\n- [misc](misc.md): Miscellany.\n- [tools](tools.md): Tools.\n",
      {
        ".ai/backlog/misc.md": "# Misc\n\n## 1. A note\n",
        ".ai/backlog/tools.md": [
          "# tools",
          "",
          "Tool integrations.",
          "",
          "## 1. A claim",
          "",
          "- site: `src/a.ts:3`",
          "- why: see `tools.2`",
          "- want: one",
          "- want:",
          "  - two",
          "  - three",
          "",
          "## 2. Another claim",
          "",
          "- done: never",
          "",
        ].join("\n"),
        ".ai/friction.md": "# Agent friction\n\n- x: tools.1 and tools.12 — y\n",
        ".claude/rules/tools.md": "# Tools\n\nSee tools.2.\n",
      },
    );

    await sync(project.root);

    const migrated = parse(project.read(".ai/backlog/tools.yml"));

    expect(existsSync(project.resolve(".ai/backlog/tools.md"))).toBe(false);

    expect(migrated).toEqual({
      purpose: "Tool integrations.",
      entries: [
        {
          id: expect.stringMatching(/^\d{6}-[\da-f]{4}$/u),
          title: "A claim",
          sites: ["src/a.ts:3"],
          why: expect.any(String),
          want: ["one", "two", "three"],
        },
        {
          id: expect.stringMatching(/^\d{6}-[\da-f]{4}$/u),
          title: "Another claim",
          done: "never",
        },
      ],
    });

    expect(parse(project.read(".ai/backlog/misc.yml"))).toMatchObject({
      purpose: "Miscellany.",
    });

    const [first, second] = migrated.entries;

    expect(first.why).toBe(`see \`${second.id}\``);

    expect(project.read(".ai/friction.md")).toBe(
      `# Agent friction\n\n- x: ${first.id} and tools.12 — y\n`,
    );

    expect(project.read(".claude/rules/tools.md")).toBe(
      `# Tools\n\nSee ${second.id}.\n`,
    );

    expect(parse(project.read(".ai/backlog/index.yml"))).toEqual({
      misc: { purpose: "Miscellany.", entries: [expect.any(String)] },
      tools: { purpose: "Tool integrations.", entries: [first.id, second.id] },
    });

    const changes = await collectChanges(
      await loadConfig(project.root, { reporter: createTestReporter() }),
      { check: true },
    );

    expect(changes).toEqual([]);
  });
});
