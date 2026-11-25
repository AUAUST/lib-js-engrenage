import { describe, expect, test } from "vitest";
import { parse, stringify } from "yaml";

import { binaryTimeout } from "#tests/utils/binaryTimeout";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { mockCwd } from "#tests/utils/mockCwd";
import { runCommand } from "#tests/utils/runCommand";

import logs from "#bin/metalbrain/logs/index";

const created = "2026-11-20T00:00:00Z";

function createProject() {
  const project = createTemporaryProject({
    "package.json": JSON.stringify({ type: "module", name: "project" }),
    "engrenage.config.ts": 'export default { runtime: { node: 24 }, agents: { preferred: ["claude"] } };',
    "src/index.ts": "",
    ".ai/friction.yml": stringify({
      entries: [
        {
          id: "FR-0a0a0a",
          subject: "pnpm install offline",
          tried: "ran pnpm install --offline in the worktree",
          stopped: "the store lacked tarballs; installed online",
          created,
        },
        {
          id: "FR-0b0b0b",
          subject: "vitest worker timeout",
          tried: "reran the agents tests",
          stopped: "raised the timeout",
          created,
        },
        {
          id: "FR-0c0c0c",
          subject: "zsh unmatched glob",
          tried: "passed a bare glob to git",
          stopped: "quoted it",
          created,
        },
      ],
    }),
  });

  mockCwd(project.root);

  return project;
}

describe("metalbrain merge", { timeout: binaryTimeout }, () => {
  test("add lists a reworded existing entry first, with its merge command", async () => {
    createProject();

    const { messages } = await runCommand(
      "friction",
      logs,
      "add",
      "--subject",
      "offline pnpm install",
      "--tried",
      "installed with pnpm --offline inside a worktree",
      "--stopped",
      "tarballs missing from the store; installed online",
    );

    const texts = messages.map(({ text }) => text);

    const [
      id,
      heading,
      first,
      command,
    ] = texts.slice(texts.findIndex((text) => /^FR-[\da-f]{6}$/u.test(text)));

    expect(id).toMatch(/^FR-[\da-f]{6}$/u);

    expect(heading).toBe(
      `Similar friction entries; merge ${id} into the one recording the same thing, if any:`,
    );

    expect(first).toMatch(/^FR-0a0a0a /u);

    expect(command).toBe(`  pnpm metalbrain friction merge ${id} FR-0a0a0a`);
  });

  test("add widens its similar entries with keywords it never writes", async () => {
    const project = createProject();

    const { messages } = await runCommand(
      "friction",
      logs,
      "add",
      "--subject",
      "shell refused the command",
      "--tried",
      "listed the changed files",
      "--stopped",
      "wrote each path by hand",
      "--keywords",
      "zsh unmatched glob",
    );

    const texts = messages.map(({ text }) => text);

    const id = texts.find((text) => /^FR-[\da-f]{6}$/u.test(text));

    expect(texts).toContain(`  pnpm metalbrain friction merge ${id} FR-0c0c0c`);

    const { entries } = parse(project.read(".ai/friction.yml")) as {
      entries: Record<string, unknown>[];
    };

    expect(entries.find((entry) => entry.id === id)).toEqual({
      id,
      subject: "shell refused the command",
      tried: "listed the changed files",
      stopped: "wrote each path by hand",
      created: expect.any(String),
    });
  });

  test("merge removes the new entry and taps the kept one with its taps and subject", async () => {
    const project = createProject();

    await runCommand("friction", logs, "tap", "FR-0b0b0b", "--note", "again");

    await runCommand("friction", logs, "merge", "FR-0b0b0b", "FR-0a0a0a");

    const { entries, taps } = parse(project.read(".ai/friction.yml"));

    expect(entries.map(({ id }: { id: string }) => id)).toEqual([
      "FR-0a0a0a",
      "FR-0c0c0c",
    ]);

    expect(entries[0].created).toBe(created);

    expect(taps).toEqual([
      {
        id: "FR-0a0a0a",
        at: expect.any(String),
        note: "again",
      },
      {
        id: "FR-0a0a0a",
        at: expect.any(String),
        note: "vitest worker timeout",
      },
    ]);
  });
});
