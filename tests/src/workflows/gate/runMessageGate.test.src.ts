import { describe, expect, test } from "vitest";

import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { runMessageGate } from "#workflows/gate/operations/runMessageGate";

function checkMessage(
  message: string,
  audience: "everyone" | "agents" = "agents",
) {
  const project = createTemporaryProject({ COMMIT_EDITMSG: message });

  return runMessageGate(`${project.root}/COMMIT_EDITMSG`, audience);
}

const longest = `fix: ${"a".repeat(67)}`;

describe("runMessageGate", () => {
  test.each([
    "fix: thing\n",
    "fix: thing\n\nCloses #1\n",
    "fix: thing\n\nCloses #1\nCloses #2\nTowards #3\n",
    `${longest}\n\n${"b".repeat(200)}\n`,
    `# ${"c".repeat(100)}\n\n${longest}\n`,
  ])("accepts %j", async (message) => {
    expect(await checkMessage(message)).toEqual({
      failures: [],
      warnings: [],
    });
  });

  test.each([
    "fix: thing\n\nCloses #1\n\nCloses #2\n",
    "fix: thing\n\nCloses #1\n\n\nTowards #2\n",
    `${longest}a\n`,
  ])("rejects %j", async (message) => {
    const { failures } = await checkMessage(message);

    expect(failures).toMatchObject([{ step: "commit message" }]);
  });

  test("checks only the subject length for everyone", async () => {
    expect(
      await checkMessage("fix: thing\n\nCloses #1\n\nCloses #2\n", "everyone"),
    ).toEqual({ failures: [], warnings: [] });

    expect(await checkMessage(`${longest}a\n`, "everyone")).toEqual({
      failures: [
        {
          step: "commit message",
          output: "Shorten the commit subject to 72 characters (it has 73): GitHub cuts a longer first line and moves the rest into the body.",
        },
      ],
      warnings: [],
    });
  });

  test("fails on a missing message file", async () => {
    const {
      failures,
    } = await runMessageGate("/missing/COMMIT_EDITMSG", "everyone");

    expect(failures).toMatchObject([{ step: "commit message" }]);
  });
});
