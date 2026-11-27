import { spawnSync } from "node:child_process";

import { describe, expect, test, vi } from "vitest";
import { parse } from "yaml";

import { defineLogGroup } from "#bin/metalbrain/logs/index";
import { createFilesystem } from "#foundation/filesystem/index";
import { recordFiles } from "#metalbrain/kinds/constants";
import { friction } from "#metalbrain/logs/constants";
import { findRecordViolations } from "#metalbrain/records/index";
import { binaryTimeout } from "#tests/utils/binaryTimeout";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { mockCwd } from "#tests/utils/mockCwd";
import { runCommand } from "#tests/utils/runCommand";

const friction1 = "entries:\n  - id: FR-0a0a0a\n    subject: git add\n    tried: ran it\n    stopped: it failed\n    created: 2026-11-20T00:00:00Z\n";

function createProject() {
  const project = createTemporaryProject({
    "package.json": JSON.stringify({ type: "module", name: "project" }),
    "engrenage.config.ts": 'export default { runtime: { node: 24 }, agents: { preferred: ["claude"] } };',
    "src/index.ts": "",
    ".gitattributes": recordFiles
      .map((file) => {
        return `/${file} merge=union\n`;
      })
      .join(""),
    ".ai/friction.yml": friction1,
  });

  mockCwd(project.root);

  return project;
}

function git(root: string, ...args: string[]) {
  const result = spawnSync(
    "git",
    ["-c", "user.name=test", "-c", "user.email=test@example.com", ...args],
    { cwd: root, encoding: "utf-8" },
  );

  if (result.status !== 0) {
    throw new Error(`git ${args.join(" ")}: ${result.stderr}${result.stdout}`);
  }

  return result.stdout;
}

function addFriction(subject: string) {
  return runCommand(
    "friction",
    defineLogGroup({ name: "friction", taps: true }),
    "add",
    "--subject",
    subject,
    "--tried",
    "ran it",
    "--stopped",
    "it failed",
  );
}

describe("metalbrain tap", { timeout: binaryTimeout }, () => {
  test("taps show in show, list and stats, and close removes them", async () => {
    const project = createProject();

    await runCommand(
      "friction",
      defineLogGroup({ name: "friction", taps: true }),
      "tap",
      "FR-0a0a0a",
      "--note",
      "again",
    );

    await runCommand(
      "friction",
      defineLogGroup({ name: "friction", taps: true }),
      "tap",
      "FR-0a0a0a",
    );

    const { messages: listed } = await runCommand(
      "friction",
      defineLogGroup({ name: "friction", taps: true }),
      "list",
    );

    expect(listed.map(({ text }) => text)).toEqual([
      "friction:",
      "└ FR-0a0a0a git add: ran it — it failed (2 taps)",
    ]);

    const { messages: shown } = await runCommand(
      "friction",
      defineLogGroup({ name: "friction", taps: true }),
      "show",
      "FR-0a0a0a",
    );

    expect(shown.slice(-3).map(({ text }) => text)).toEqual([
      "  taps:",
      expect.stringMatching(/^ {2}├ \S+Z again$/u),
      expect.stringMatching(/^ {2}└ \S+Z$/u),
    ]);

    const { messages: counted } = await runCommand(
      "friction",
      defineLogGroup({ name: "friction", taps: true }),
      "stats",
    );

    expect(counted.map(({ text }) => text)).toEqual(["3 git add (recurring)"]);

    await addFriction("zsh");

    await runCommand(
      "friction",
      defineLogGroup({ name: "friction", taps: true }),
      "close",
      "FR-0a0a0a",
    );

    expect(project.read(".ai/friction.yml")).not.toContain("taps");
  });

  test("rejects a multi-line note, tapping nothing", async () => {
    const project = createProject();

    await expect(
      runCommand(
        "friction",
        defineLogGroup({ name: "friction", taps: true }),
        "tap",
        "FR-0a0a0a",
        "--note",
        "a\nb",
      ),
    ).rejects.toThrow("A tap note is one line of text");

    expect(project.read(".ai/friction.yml")).toBe(friction1);
  });

  test("two worktrees tapping one entry and appending one at different seconds merge without conflict", async () => {
    const project = createProject();

    git(project.root, "init", "-q", "-b", "main");

    git(project.root, "add", "-A");

    git(project.root, "commit", "-qm", "base");

    git(project.root, "checkout", "-qb", "other");

    vi.useFakeTimers({
      toFake: ["Date"],
      now: Date.parse("2026-11-25T10:00:00Z"),
    });

    await runCommand(
      "friction",
      defineLogGroup({ name: "friction", taps: true }),
      "tap",
      "FR-0a0a0a",
      "--note",
      "other",
    );

    await addFriction("other branch");

    git(project.root, "commit", "-qam", "other");

    git(project.root, "checkout", "-q", "main");

    vi.setSystemTime(Date.parse("2026-11-25T10:00:05Z"));

    await runCommand(
      "friction",
      defineLogGroup({ name: "friction", taps: true }),
      "tap",
      "FR-0a0a0a",
      "--note",
      "main",
    );

    await addFriction("main branch");

    git(project.root, "commit", "-qam", "main");

    vi.useRealTimers();

    git(project.root, "merge", "-q", "other", "-m", "merge");

    const merged = parse(project.read(".ai/friction.yml"));

    expect(
      merged.taps.map(({ note }: { note: string }) => note).toSorted(),
    ).toEqual(["main", "other"]);

    expect(
      merged.entries.map(({ subject }: { subject: string }) => subject),
    ).toEqual(["git add", "main branch", "other branch"]);

    expect(
      await findRecordViolations(createFilesystem(project.root), friction, 200),
    ).toEqual([]);
  });
});
