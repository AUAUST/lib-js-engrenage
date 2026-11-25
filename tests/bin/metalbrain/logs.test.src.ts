import { existsSync } from "node:fs";

import { describe, expect, test } from "vitest";
import { parse } from "yaml";

import { binaryTimeout } from "#tests/utils/binaryTimeout";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { mockCwd } from "#tests/utils/mockCwd";
import { runCommand } from "#tests/utils/runCommand";

import logs from "#bin/metalbrain/logs/index";

function createProject(files: Readonly<Record<string, string>> = {}) {
  const project = createTemporaryProject({
    "package.json": JSON.stringify({ type: "module", name: "project" }),
    "engrenage.config.ts": 'export default { runtime: { node: 24 }, agents: { preferred: ["claude"] } };',
    "src/index.ts": "",
    ...files,
  });

  mockCwd(project.root);

  return project;
}

function addFriction(subject: string) {
  return runCommand(
    "friction",
    logs,
    "add",
    "--subject",
    subject,
    "--tried",
    "ran it",
    "--stopped",
    "it failed; reran",
  );
}

describe("metalbrain friction", { timeout: binaryTimeout }, () => {
  test("add writes an entry with the kind's fields and prints its ID", async () => {
    const project = createProject();

    const { messages } = await addFriction("git add");

    const id = messages.at(-1)?.text ?? "";

    expect(id).toMatch(/^FR-[\da-f]{6}$/u);

    expect(parse(project.read(".ai/friction.yml"))).toEqual({
      entries: [
        {
          id,
          subject: "git add",
          tried: "ran it",
          stopped: "it failed; reran",
        },
      ],
    });
  });

  test("stats flags a subject with three entries as recurring", async () => {
    createProject();

    await addFriction("git add");

    await addFriction("Git add");

    await addFriction("git add");

    await addFriction("zsh globs");

    const { messages } = await runCommand("friction", logs, "stats");

    expect(messages.map(({ text }) => text)).toEqual([
      "3 git add (recurring)",
      "1 zsh globs",
    ]);
  });

  test("close removes the entry, deleting the file with its last one", async () => {
    const project = createProject({
      ".ai/pending.yml": "entries:\n  - id: PD-0a0a0a\n    subject: docs\n    what: write them\n    why: out of scope\n",
    });

    const { messages } = await runCommand("pending", logs, "list");

    expect(messages.map(({ text }) => text)).toEqual([
      "PD-0a0a0a docs: write them — out of scope",
    ]);

    await runCommand("pending", logs, "close", "PD-0a0a0a");

    expect(existsSync(project.resolve(".ai/pending.yml"))).toBe(false);
  });
});
