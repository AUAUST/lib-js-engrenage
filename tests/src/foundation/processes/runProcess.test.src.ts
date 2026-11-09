import { describe, expect, test } from "vitest";

import { runProcess } from "#foundation/processes/operations/runProcess";

describe("runProcess", () => {
  test("returns the output of a succeeding command", async () => {
    const { stdout } = await runProcess(
      process.execPath,
      ["--eval", "process.stdout.write('done')"],
      {},
    );

    expect(stdout).toBe("done");
  });

  test("names the command and the code of a failing command", async () => {
    await expect(
      runProcess(process.execPath, ["--eval", "process.exit(1)"], {}),
    ).rejects.toThrow(
      `${process.execPath} --eval process.exit(1) exited with code 1`,
    );
  });
});
