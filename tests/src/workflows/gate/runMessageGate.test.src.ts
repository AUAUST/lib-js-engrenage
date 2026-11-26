import { readFileSync } from "node:fs";

import { describe, expect, test } from "vitest";

import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { runMessageGate } from "#workflows/gate/operations/runMessageGate";

function checkMessage(
  message: string,
  audience: "everyone" | "agents" = "agents",
  attribution?: boolean,
) {
  const project = createTemporaryProject({ COMMIT_EDITMSG: message });

  return runMessageGate(`${project.root}/COMMIT_EDITMSG`, {
    audience,
    attribution,
  });
}

const longest = `fix: ${"a".repeat(67)}`;

describe("runMessageGate", () => {
  test.each([
    "fix: thing\n",
    "fix: thing\n\nCloses #1\n",
    "fix: thing\n\nCloses #1\nCloses #2\nTowards #3\n",
    `${longest}\n\nCloses #${"1".repeat(200)}\n`,
    `# ${"c".repeat(100)}\n\n${longest}\n`,
    "brain: thing\n\nCloses #1\n# ------------------------ >8 ------------------------\nany diff\n",
    "Merge branch 'main' of https://github.com/x/y\n",
    'Revert "fix: thing"\n\nThis reverts commit abc.\n',
    "fix: thing\n\nCloses #1\n\nCo-Authored-By: Claude <noreply@anthropic.com>\n",
  ])("accepts %j", async (message) => {
    expect(await checkMessage(message)).toEqual({
      failures: [],
      warnings: [],
      rewritten: false,
    });
  });

  test.each([
    `${longest}a\n`,
    "Fix thing\n",
    "wip: thing\n",
    "fix:thing\n",
    "fix: thing\n\nExplains the change.\nCloses #1\n",
    "fix: thing\n\ncloses the gap\n",
  ])("rejects %j", async (message) => {
    const { failures } = await checkMessage(message);

    expect(failures).toMatchObject([{ step: "commit message" }]);
  });

  test("checks only the subject length for everyone", async () => {
    expect(await checkMessage("Fix thing\n\nAny prose.\n", "everyone")).toEqual(
      {
        failures: [],
        warnings: [],
        rewritten: false,
      },
    );

    expect(await checkMessage(`${longest}a\n`, "everyone")).toEqual({
      failures: [
        {
          step: "commit message",
          output: "Shorten the commit subject to 72 characters (it has 73): GitHub cuts a longer first line and moves the rest into the body.",
        },
      ],
      warnings: [],
      rewritten: false,
    });
  });

  test.each([
    [
      "feat: my message\n\ncloses 1,#2 3\n\ntoward 4,5 #6\n",
      "feat: my message\n\nCloses #1\nCloses #2\nCloses #3\nTowards #4\nTowards #5\nTowards #6\n",
    ],
    [
      "fix: thing\n\nTowards #2\nCloses #2, #1\n",
      "fix: thing\n\nCloses #2\nCloses #1\n",
    ],
    [
      "fix: thing\n\nCloses #1\n\n\nTowards #2\n",
      "fix: thing\n\nCloses #1\nTowards #2\n",
    ],
    [
      "fix: thing\n\nCLOSED #1\n# comment\n# ------------------------ >8 ------------------------\nany diff\n",
      "fix: thing\n\nCloses #1\n\n# comment\n# ------------------------ >8 ------------------------\nany diff\n",
    ],
  ])("rewrites %j for both audiences", async (message, rewritten) => {
    for (const audience of ["agents", "everyone"] as const) {
      const project = createTemporaryProject({ COMMIT_EDITMSG: message });

      const file = `${project.root}/COMMIT_EDITMSG`;

      expect(await runMessageGate(file, { audience })).toEqual({
        failures: [],
        warnings: [],
        rewritten: true,
      });

      expect(readFileSync(file, "utf-8")).toBe(rewritten);
    }
  });

  test("keeps prose and moves references under everyone", async () => {
    const message = "Fix thing\n\nclose 1 2 3 4 5\n\ncloses the gap\ntoward 6\n\nCo-Authored-By: A <a@b.c>\n";

    const project = createTemporaryProject({ COMMIT_EDITMSG: message });

    const file = `${project.root}/COMMIT_EDITMSG`;

    expect(await runMessageGate(file, { audience: "everyone" })).toEqual({
      failures: [],
      warnings: [],
      rewritten: true,
    });

    expect(readFileSync(file, "utf-8")).toBe(
      "Fix thing\n\ncloses the gap\n\nCloses #1\nCloses #2\nCloses #3\nCloses #4\nCloses #5\nTowards #6\n\nCo-Authored-By: A <a@b.c>\n",
    );
  });

  test("keeps a canonical message byte-identical", async () => {
    const message = "# note\n\nfix: thing\n\n\nCloses #1\nTowards #2  \n\n# Please enter\n";

    const project = createTemporaryProject({ COMMIT_EDITMSG: message });

    const file = `${project.root}/COMMIT_EDITMSG`;

    expect((await runMessageGate(file, { audience: "agents" })).rewritten).toBe(
      false,
    );

    expect(readFileSync(file, "utf-8")).toBe(message);
  });

  test("refuses attribution lines only when attribution is off", async () => {
    const message = "fix: thing\n\n🤖 Generated with [Claude Code](https://claude.com/claude-code)\n";

    expect((await checkMessage(message, "agents", true)).failures).toEqual([]);

    expect((await checkMessage(message, "agents", false)).failures).toEqual([
      {
        step: "commit message",
        output: expect.stringContaining("agents.attribution is false"),
      },
    ]);
  });

  test("fails on a missing message file", async () => {
    const { failures } = await runMessageGate("/missing/COMMIT_EDITMSG", {
      audience: "everyone",
    });

    expect(failures).toMatchObject([{ step: "commit message" }]);
  });
});
