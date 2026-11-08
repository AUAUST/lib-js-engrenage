import { execFile } from "node:child_process";
import { promisify } from "node:util";

import { expect, test } from "vitest";

import { binaryTimeout } from "#tests/utils/binaryTimeout";
import { getExecutable } from "#tests/utils/getExecutable";
import { getFixture } from "#tests/utils/getFixture";

import manifest from "#package.json" with { type: "json" };

const run = promisify(execFile);

test("the executable prints its version", async () => {
  const { stdout } = await run(process.execPath, [
    getExecutable(),
    "--version",
  ]);

  expect(stdout.trim()).toBe(manifest.version);
});

test(
  "the executable lists the markers of the working directory",
  { timeout: binaryTimeout },
  async () => {
    const { stdout } = await run(process.execPath, [getExecutable(), "debt"], {
      cwd: getFixture("debt"),
    });

    expect(stdout.trim()).toBe(
      "src/marked.ts:1  first marker in a source file",
    );
  },
);

test(
  "the executable lists every option of a lazy command in its help",
  { timeout: binaryTimeout },
  async () => {
    const { stdout } = await run(process.execPath, [
      getExecutable(),
      "help",
      "sync",
    ]);

    expect(stdout).toContain("--check");
    expect(stdout).toContain("--vscode-settings");
  },
);
