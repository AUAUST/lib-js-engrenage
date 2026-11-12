import { describe, expect, test } from "vitest";

import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { runMessageGate } from "#workflows/gate/operations/runMessageGate";

function checkMessage(message: string) {
  const project = createTemporaryProject({ COMMIT_EDITMSG: message });

  return runMessageGate(`${project.root}/COMMIT_EDITMSG`);
}

describe("runMessageGate", () => {
  test.each([
    "fix: thing\n",
    "fix: thing\n\nCloses #1\n",
    "fix: thing\n\nCloses #1\nCloses #2\nTowards #3\n",
  ])("accepts %j", async (message) => {
    expect(await checkMessage(message)).toEqual({
      failures: [],
      warnings: [],
    });
  });

  test.each([
    "fix: thing\n\nCloses #1\n\nCloses #2\n",
    "fix: thing\n\nCloses #1\n\n\nTowards #2\n",
  ])("rejects %j", async (message) => {
    const { failures } = await checkMessage(message);

    expect(failures).toMatchObject([{ step: "commit message" }]);
  });

  test("fails on a missing message file", async () => {
    const { failures } = await runMessageGate("/missing/COMMIT_EDITMSG");

    expect(failures).toMatchObject([{ step: "commit message" }]);
  });
});
