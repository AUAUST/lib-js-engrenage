import { describe, expect, test } from "vitest";
import { parse } from "yaml";

import { createFilesystem } from "#foundation/filesystem/index";
import { migrateAgentLogs } from "#metalbrain/logs/index";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";

const day = new Date("2026-11-22");

const instructionFiles = [".claude/rules/*.md"];

describe("migrateAgentLogs", () => {
  test("appends each log line as an entry with its subject and text, after the entries already migrated", async () => {
    const project = createTemporaryProject({
      ".claude/rules/records.md": "Log friction with `pnpm metalbrain friction add`.\n",
      ".ai/friction.yml": "entries:\n  - id: 261101-0001\n    subject: earlier\n    tried: a\n    stopped: b\n",
      ".ai/friction.md": "# Agent friction\n\n- `git add` by path: staged a deletion — pathspec failed; staged with -A\n",
    });

    const filesystem = createFilesystem(project.root);

    expect(await migrateAgentLogs(filesystem, day, instructionFiles)).toEqual(
      [],
    );

    const {
      entries,
    } = parse((await filesystem.read(".ai/friction.yml")) ?? "");

    expect(entries).toEqual([
      {
        id: "261101-0001",
        subject: "earlier",
        tried: "a",
        stopped: "b",
      },
      {
        id: expect.stringMatching(/^261122-[\da-f]{4}$/u),
        subject: "`git add` by path",
        tried: "staged a deletion",
        stopped: "pathspec failed; staged with -A",
      },
    ]);

    expect(await filesystem.exists(".ai/friction.md")).toBe(false);
  });

  test("fails naming each line without the log line shape, writing nothing", async () => {
    const project = createTemporaryProject({
      ".ai/friction.md": "# Agent friction\n\n- subject: tried — stopped\n",
      ".ai/discarded.md": "# Discarded solutions\n\n- a library — no colon\n",
    });

    const filesystem = createFilesystem(project.root);

    await expect(
      migrateAgentLogs(filesystem, day, instructionFiles),
    ).rejects.toThrow(
      ".ai/discarded.md:3: expected `- <subject>: <need> — <reason>`",
    );

    expect(await filesystem.exists(".ai/friction.yml")).toBe(false);

    expect(await filesystem.exists(".ai/friction.md")).toBe(true);
  });

  test("leaves the logs while an instruction file names one", async () => {
    const project = createTemporaryProject({
      ".claude/rules/records.md": "Append to `.ai/friction.md`.\n",
      ".ai/friction.md": "- subject: tried — stopped\n",
    });

    const filesystem = createFilesystem(project.root);

    expect(await migrateAgentLogs(filesystem, day, instructionFiles)).toEqual([
      ".claude/rules/records.md",
    ]);

    expect(await filesystem.exists(".ai/friction.yml")).toBe(false);
  });
});
