import { spawnSync } from "node:child_process";

import { describe, expect, test } from "vitest";
import { parse } from "yaml";

import { binaryTimeout } from "#tests/utils/binaryTimeout";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { getExecutable } from "#tests/utils/getExecutable";
import { mockCwd } from "#tests/utils/mockCwd";
import { runCommand } from "#tests/utils/runCommand";

import backlog from "#bin/metalbrain/backlog/index";

const tools = "purpose: Tools.\nentries:\n  - id: 261122-3fa9\n    title: A claim\n    sites: [src/a.ts:3]\n    want: [one, two]\n";

function createProject() {
  const project = createTemporaryProject({
    "package.json": JSON.stringify({ type: "module", name: "project" }),
    "engrenage.config.ts": 'export default { runtime: { node: 24 }, agents: { preferred: ["claude"] } };',
    "src/index.ts": "",
    "src/a.ts": "",
    ".ai/backlog/index.md": "# Backlog\n",
    ".ai/backlog/tools.yml": tools,
  });

  mockCwd(project.root);

  return project;
}

describe("metalbrain backlog", { timeout: binaryTimeout }, () => {
  test("create writes the category and lists it in index.yml, refusing it once it exists", async () => {
    const project = createProject();

    await runCommand("backlog", backlog, "create", "cli", "Command handling.");

    expect(project.read(".ai/backlog/cli.yml")).toBe(
      "purpose: Command handling.\nentries: []\n",
    );

    expect(parse(project.read(".ai/backlog/index.yml"))).toEqual({
      cli: { purpose: "Command handling.", entries: [] },
      tools: { purpose: "Tools.", entries: ["261122-3fa9"] },
    });

    await expect(
      runCommand("backlog", backlog, "create", "cli", "Again."),
    ).rejects.toThrow('Backlog category "cli" already exists');
  });

  test("add appends the entry after the others and prints its ID", async () => {
    const project = createProject();

    const { messages } = await runCommand(
      "backlog",
      backlog,
      "add",
      "tools",
      "Another claim",
      "--sites",
      "src/a.ts:1,src/index.ts:1",
      "--why",
      "reason",
      "--want",
      "first",
      "--want",
      "second",
    );

    const id = messages.at(-1)?.text ?? "";

    expect(id).toMatch(/^\d{6}-[\da-f]{4}$/u);

    expect(project.read(".ai/backlog/tools.yml")).toBe(
      `${tools}  - id: ${id}\n    title: Another claim\n    sites:\n      - src/a.ts:1\n      - src/index.ts:1\n    why: reason\n    want:\n      - first\n      - second\n`,
    );

    expect(parse(project.read(".ai/backlog/index.yml"))).toEqual({
      tools: { purpose: "Tools.", entries: ["261122-3fa9", id] },
    });
  });

  test("add writes nothing when an option breaks the schema, naming the violation", async () => {
    const project = createProject();

    await expect(
      runCommand(
        "backlog",
        backlog,
        "add",
        "tools",
        "A claim",
        "--sites",
        "src/missing.ts:3",
      ),
    ).rejects.toThrow("site `src/missing.ts` names no file");

    expect(project.read(".ai/backlog/tools.yml")).toBe(tools);
  });

  test("add into a missing category fails loudly, naming backlog create", () => {
    const project = createProject();

    const result = spawnSync(
      process.execPath,
      [getExecutable("metalbrain"), "backlog", "add", "docs", "A claim"],
      {
        cwd: project.root,
        encoding: "utf-8",
      },
    );

    expect(result.status).toBe(1);
    expect(result.stderr).toContain("pnpm metalbrain backlog create docs");
  });
});
