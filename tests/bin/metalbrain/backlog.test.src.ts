import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";

import { describe, expect, test } from "vitest";
import { parse } from "yaml";

import { binaryTimeout } from "#tests/utils/binaryTimeout";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { getExecutable } from "#tests/utils/getExecutable";
import { mockCwd } from "#tests/utils/mockCwd";
import { runCommand } from "#tests/utils/runCommand";

import backlog from "#bin/metalbrain/backlog/index";

const tools = "purpose: Tools.\nentries:\n  - id: BL-3fa9c1\n    created: 2026-11-20T00:00:00Z\n    title: A claim\n    sites: [src/a.ts:3]\n    want: [one, two]\n";

const docs = "purpose: Docs.\nentries:\n  - id: BL-0b1c2d\n    created: 2026-11-20T00:00:00Z\n    title: Document the gate\n    why: [first, second]\n";

function createProject() {
  const project = createTemporaryProject({
    "package.json": JSON.stringify({ type: "module", name: "project" }),
    "engrenage.config.ts": 'export default { runtime: { node: 24 }, agents: { preferred: ["claude"] } };',
    "src/index.ts": "",
    "src/a.ts": "",
    ".ai/backlog/index.md": "# Backlog\n",
    ".ai/backlog/tools.yml": tools,
    ".ai/backlog/docs.yml": docs,
    ".ai/backlog/index.yml": "tools:\n  purpose: Tools.\n  entries: [BL-3fa9c1]\ndocs:\n  purpose: Docs.\n  entries: [BL-0b1c2d]\n",
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
      docs: { purpose: "Docs.", entries: ["BL-0b1c2d"] },
      tools: { purpose: "Tools.", entries: ["BL-3fa9c1"] },
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

    expect(id).toMatch(/^BL-[\da-f]{6}$/u);

    const created = parse(project.read(".ai/backlog/tools.yml")).entries[1]
      .created;

    expect(created).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/u);

    expect(project.read(".ai/backlog/tools.yml")).toBe(
      `${tools}  - id: ${id}\n    title: Another claim\n    sites:\n      - src/a.ts:1\n      - src/index.ts:1\n    why: reason\n    want:\n      - first\n      - second\n    created: ${created}\n`,
    );

    expect(parse(project.read(".ai/backlog/index.yml"))).toEqual({
      docs: { purpose: "Docs.", entries: ["BL-0b1c2d"] },
      tools: { purpose: "Tools.", entries: ["BL-3fa9c1", id] },
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

  test("add states the configured word cap in its help", () => {
    const project = createProject();

    project.write(
      "engrenage.config.ts",
      'export default { runtime: { node: 24 }, agents: { preferred: ["claude"], wordCaps: { backlogEntry: 12 } } };',
    );

    const result = spawnSync(
      process.execPath,
      [getExecutable("metalbrain"), "backlog", "add", "--help"],
      {
        cwd: project.root,
        encoding: "utf-8",
      },
    );

    expect(result.status).toBe(0);
    expect(result.stdout).toContain("at most 12 words");
  });

  test("add refuses an entry over the word cap, stating its word count and the cap", async () => {
    const project = createProject();

    await expect(
      runCommand(
        "backlog",
        backlog,
        "add",
        "tools",
        "A claim",
        "--why",
        Array.from({ length: 120 }, () => "word").join(" "),
      ),
    ).rejects.toThrow("122 words, over the backlogEntry word cap of 100");

    expect(project.read(".ai/backlog/tools.yml")).toBe(tools);
  });

  test("move keeps the ID in the new category and drops it from the old one", async () => {
    const project = createProject();

    await runCommand("backlog", backlog, "move", "BL-3fa9c1", "docs");

    expect(parse(project.read(".ai/backlog/docs.yml"))).toEqual({
      purpose: "Docs.",
      entries: [
        {
          id: "BL-0b1c2d",
          created: "2026-11-20T00:00:00Z",
          title: "Document the gate",
          why: ["first", "second"],
        },
        {
          id: "BL-3fa9c1",
          created: "2026-11-20T00:00:00Z",
          title: "A claim",
          sites: ["src/a.ts:3"],
          want: ["one", "two"],
        },
      ],
    });

    expect(existsSync(project.resolve(".ai/backlog/tools.yml"))).toBe(false);

    const { messages } = await runCommand("backlog", backlog, "list", "docs");

    expect(messages.map(({ text }) => text)).toEqual([
      "backlog:",
      "└ docs:",
      "  BL-0b1c2d Document the gate",
      "  BL-3fa9c1 A claim",
    ]);
  });

  test("close of a category's last entry deletes the category and its index entry", async () => {
    const project = createProject();

    await runCommand("backlog", backlog, "close", "BL-0b1c2d");

    expect(existsSync(project.resolve(".ai/backlog/docs.yml"))).toBe(false);

    expect(parse(project.read(".ai/backlog/index.yml"))).toEqual({
      tools: { purpose: "Tools.", entries: ["BL-3fa9c1"] },
    });

    const { messages } = await runCommand("backlog", backlog, "categories");

    expect(messages.map(({ text }) => text)).toEqual(["tools (1): Tools."]);
  });

  test("close of a comma-separated ID closes that entry only", async () => {
    const project = createProject();

    await runCommand("backlog", backlog, "close", "BL-0b1c2d,,");

    expect(existsSync(project.resolve(".ai/backlog/docs.yml"))).toBe(false);

    expect(project.read(".ai/backlog/tools.yml")).toBe(tools);
  });

  test("close of a live and an unknown ID closes nothing, naming the unknown one", async () => {
    const project = createProject();

    await expect(
      runCommand("backlog", backlog, "close", "BL-0b1c2d", "BL-ffffff"),
    ).rejects.toThrow("No entry was closed:\n- No backlog entry BL-ffffff");

    expect(project.read(".ai/backlog/docs.yml")).toBe(docs);
  });

  test("relocate rewrites the sites under a moved directory, keeping their lines", async () => {
    const project = createProject();

    project.write("lib/a.ts", "");

    const {
      messages,
    } = await runCommand("backlog", backlog, "relocate", "src/", "lib");

    expect(messages.map(({ text }) => text)).toContain(
      "BL-3fa9c1 src/a.ts:3 → lib/a.ts:3",
    );

    expect(project.read(".ai/backlog/tools.yml")).toBe(
      tools.replace("src/a.ts:3", "lib/a.ts:3"),
    );

    await expect(
      runCommand("backlog", backlog, "relocate", "lib/a.ts", "lib/b.ts"),
    ).rejects.toThrow("site `lib/b.ts` names no file");
  });

  test("update replaces and unsets fields, and search finds the entry by any field", async () => {
    const project = createProject();

    await runCommand(
      "backlog",
      backlog,
      "update",
      "BL-3fa9c1",
      "--why",
      "a reason",
      "--unset",
      "sites",
    );

    expect(project.read(".ai/backlog/tools.yml")).toBe(
      "purpose: Tools.\nentries:\n  - id: BL-3fa9c1\n    title: A claim\n    why: a reason\n    want: [one, two]\n    created: 2026-11-20T00:00:00Z\n",
    );

    const {
      messages,
    } = await runCommand("backlog", backlog, "search", "REASON");

    expect(messages.map(({ text }) => text)).toEqual([
      "backlog:",
      "└ tools:",
      "  BL-3fa9c1 A claim",
    ]);
  });

  test("add into a missing category fails loudly, naming backlog create", () => {
    const project = createProject();

    const result = spawnSync(
      process.execPath,
      [getExecutable("metalbrain"), "backlog", "add", "cli", "A claim"],
      {
        cwd: project.root,
        encoding: "utf-8",
      },
    );

    expect(result.status).toBe(1);
    expect(result.stderr).toContain("pnpm metalbrain backlog create cli");
  });
});
