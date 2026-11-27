import { existsSync } from "node:fs";

import { describe, expect, test } from "vitest";
import { parse } from "yaml";

import { defineLogGroup } from "#bin/metalbrain/logs/index";
import { logKinds } from "#metalbrain/logs/constants";
import { CommandUsageError } from "#nexus/cli/index";
import { binaryTimeout } from "#tests/utils/binaryTimeout";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { mockCwd } from "#tests/utils/mockCwd";
import { runCommand } from "#tests/utils/runCommand";

import builtins from "#bin/metalbrain/builtins";

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
    defineLogGroup({ name: "friction", taps: true }),
    "add",
    "--subject",
    subject,
    "--tried",
    "ran it",
    "--stopped",
    "it failed; reran",
  );
}

const recordTime = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/u;

describe("metalbrain friction", { timeout: binaryTimeout }, () => {
  test("add writes an entry with the kind's fields and prints its ID", async () => {
    const project = createProject();

    const before = Math.floor(Date.now() / 1000) * 1000;

    const { messages } = await addFriction("git add");

    const after = Date.now();

    const id = messages.at(-1)?.text ?? "";

    expect(id).toMatch(/^FR-[\da-f]{6}$/u);

    expect(parse(project.read(".ai/friction.yml"))).toEqual({
      entries: [
        {
          id,
          created: expect.stringMatching(recordTime),
          subject: "git add",
          tried: "ran it",
          stopped: "it failed; reran",
        },
      ],
    });

    const created = Date.parse(
      parse(project.read(".ai/friction.yml")).entries[0].created,
    );

    expect(created).toBeGreaterThanOrEqual(before);

    expect(created).toBeLessThanOrEqual(after);
  });

  test("add chains invocations with --next, printing each ID in order", async () => {
    const project = createProject();

    const { messages } = await runCommand(
      "friction",
      defineLogGroup({ name: "friction", taps: true }),
      "add",
      "--subject",
      "git add",
      "--tried",
      "ran it",
      "--stopped=--next",
      "--next",
      "friction",
      "add",
      "--subject",
      "zsh globs",
      "--tried",
      "quoted it",
      "--stopped",
      "it matched",
    );

    const { entries } = parse(project.read(".ai/friction.yml"));

    expect(entries).toMatchObject([
      { subject: "git add", stopped: "--next" },
      { subject: "zsh globs", stopped: "it matched" },
    ]);

    expect(
      messages.map(({ text }) => text).filter((text) => text.startsWith("FR-")),
    ).toEqual(entries.map(({ id }: { id: string }) => id));
  });

  test("add keeps an earlier invocation's entry when a later one fails", async () => {
    const project = createProject();

    await expect(
      runCommand(
        "friction",
        defineLogGroup({ name: "friction", taps: true }),
        "add",
        "--subject",
        "git add",
        "--tried",
        "ran it",
        "--stopped",
        "it failed",
        "--next",
        "friction",
        "add",
        "--subject",
        "zsh globs",
        "--tried",
        "quoted it",
        "--stopped",
        "word ".repeat(200),
      ),
    ).rejects.toThrow(/^The entry would break the friction file/u);

    expect(parse(project.read(".ai/friction.yml")).entries).toMatchObject([
      { subject: "git add" },
    ]);
  });

  test("stats flags a subject with three entries as recurring", async () => {
    createProject();

    await addFriction("git add");

    await addFriction("Git add");

    await addFriction("git add");

    await addFriction("zsh globs");

    const { messages } = await runCommand(
      "friction",
      defineLogGroup({ name: "friction", taps: true }),
      "stats",
    );

    expect(messages.map(({ text }) => text)).toEqual([
      "3 git add (recurring)",
      "1 zsh globs",
    ]);
  });

  test("update replaces only the given field, the entry still valid", async () => {
    const project = createProject();

    const { messages } = await addFriction("git add");

    const id = messages.at(-1)?.text ?? "";

    await runCommand(
      "friction",
      defineLogGroup({ name: "friction", taps: true }),
      "update",
      id,
      "--stopped",
      "c",
    );

    expect(parse(project.read(".ai/friction.yml"))).toEqual({
      entries: [
        {
          id,
          created: expect.stringMatching(recordTime),
          subject: "git add",
          tried: "ran it",
          stopped: "c",
        },
      ],
    });

    const { messages: shown } = await runCommand(
      "friction",
      defineLogGroup({ name: "friction", taps: true }),
      "show",
      id,
    );

    expect(shown.map(({ text }) => text)).toEqual([
      "friction:",
      `└ ${id} git add`,
      "  tried: ran it",
      "  stopped: c",
      expect.stringMatching(/^ {2}created: \S+$/u),
    ]);
  });

  test("close removes the entry, deleting the file with its last one", async () => {
    const project = createProject({
      ".ai/pending.yml": "entries:\n  - id: PD-0a0a0a\n    created: 2026-11-20T00:00:00Z\n    subject: docs\n    what: write them\n    why: out of scope\n",
    });

    const { messages } = await runCommand(
      "pending",
      defineLogGroup({ name: "pending", taps: false }),
      "list",
    );

    expect(messages.map(({ text }) => text)).toEqual([
      "pending:",
      "└ PD-0a0a0a docs: write them — out of scope",
    ]);

    await runCommand(
      "pending",
      defineLogGroup({ name: "pending", taps: false }),
      "close",
      "PD-0a0a0a",
    );

    expect(existsSync(project.resolve(".ai/pending.yml"))).toBe(false);
  });
});

describe("metalbrain pending", { timeout: binaryTimeout }, () => {
  const entries = "entries:\n  - id: PD-0a0a0a\n    created: 2026-11-20T00:00:00Z\n    subject: docs\n    what: write them\n    why: out of scope\n    owner: AUAUST/lib-js-engrenage#913\n  - id: PD-0b0b0b\n    created: 2026-11-21T00:00:00Z\n    subject: tests\n    what: add them\n    why: out of scope\n";

  test("add writes the owner, and list and search filter by it", async () => {
    const project = createProject({ ".ai/pending.yml": entries });

    const { messages } = await runCommand(
      "pending",
      defineLogGroup({ name: "pending", taps: false }),
      "add",
      "--subject",
      "changeset",
      "--what",
      "write it",
      "--why",
      "after the review",
      "--owner",
      "BL-0c0c0c",
    );

    const id = messages.at(-1)?.text ?? "";

    expect(parse(project.read(".ai/pending.yml")).entries[2]).toEqual({
      id,
      created: expect.stringMatching(recordTime),
      subject: "changeset",
      what: "write it",
      why: "after the review",
      owner: "BL-0c0c0c",
    });

    const listed = await runCommand(
      "pending",
      defineLogGroup({ name: "pending", taps: false }),
      "list",
      "--owner",
      "AUAUST/lib-js-engrenage#913",
    );

    expect(listed.messages.map(({ text }) => text)).toEqual([
      "pending:",
      "└ PD-0a0a0a docs: write them — out of scope — AUAUST/lib-js-engrenage#913",
    ]);

    const searched = await runCommand(
      "pending",
      defineLogGroup({ name: "pending", taps: false }),
      "search",
      "owner:BL-0c0c0c",
    );

    expect(searched.messages.map(({ text }) => text).join("\n")).toContain(id);

    expect(
      searched.messages
        .map(({ text }) => {
          return text;
        })
        .join("\n"),
    ).not.toContain("PD-0a0a0a");
  });

  test("add without --owner is a usage error, writing nothing", async () => {
    const project = createProject({ ".ai/pending.yml": entries });

    await expect(
      runCommand(
        "pending",
        defineLogGroup({ name: "pending", taps: false }),
        "add",
        "--subject",
        "a",
        "--what",
        "b",
        "--why",
        "c",
      ),
    ).rejects.toThrow(
      new CommandUsageError("required option '--owner <text>' not specified"),
    );

    expect(project.read(".ai/pending.yml")).toBe(entries);
  });

  test("offers no tap or merge, its entries without an owner still valid", async () => {
    createProject({ ".ai/pending.yml": entries });

    for (const kind of logKinds) {
      const group = builtins.find(({ name }) => name === kind.name);

      const names = group?.kind === "parsing"
        ? group.subcommands.map(({ name }) => name)
        : [];

      expect(names).toContain("close");

      expect(names.includes("tap")).toBe(kind.name !== "pending");

      expect(names.includes("merge")).toBe(kind.name !== "pending");
    }

    await runCommand(
      "pending",
      defineLogGroup({ name: "pending", taps: false }),
      "update",
      "PD-0b0b0b",
      "--what",
      "add a case",
    );

    const { messages } = await runCommand(
      "pending",
      defineLogGroup({ name: "pending", taps: false }),
      "list",
    );

    expect(messages.map(({ text }) => text)).toContain(
      "└ PD-0b0b0b tests: add a case — out of scope",
    );
  });
});

describe("metalbrain missing", { timeout: binaryTimeout }, () => {
  test("add writes the capability, its need and what was done instead", async () => {
    const project = createProject();

    const { messages } = await runCommand(
      "missing",
      defineLogGroup({ name: "missing", taps: true }),
      "add",
      "--subject",
      "deep object merge",
      "--need",
      "merge config layers",
      "--instead",
      "local helper in src/x.ts",
    );

    const id = messages.at(-1)?.text ?? "";

    expect(id).toMatch(/^MI-[\da-f]{6}$/u);

    expect(parse(project.read(".ai/missing.yml"))).toEqual({
      entries: [
        {
          id,
          created: expect.stringMatching(recordTime),
          subject: "deep object merge",
          need: "merge config layers",
          instead: "local helper in src/x.ts",
        },
      ],
    });
  });
});
