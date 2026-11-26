import { execFile } from "node:child_process";
import { promisify } from "node:util";

import { expect, test } from "vitest";

import { binaryTimeout } from "#tests/utils/binaryTimeout";
import { getExecutable } from "#tests/utils/getExecutable";

import manifest from "#package.json" with { type: "json" };

const run = promisify(execFile);

test("the executable prints its version", async () => {
  const {
    stdout,
  } = await run(process.execPath, [getExecutable(), "--version"]);

  expect(stdout.trim()).toBe(manifest.version);
});

test(
  "the executable rejects `debt`, moved to `metalbrain debt`",
  { timeout: binaryTimeout },
  async () => {
    const failure = run(process.execPath, [getExecutable(), "debt"]);

    await expect(failure).rejects.toMatchObject({
      stderr: expect.stringContaining("unknown command 'debt'"),
    });
  },
);

test(
  "the executable rejects `batiment`, moved to its own `batiment` command",
  { timeout: binaryTimeout },
  async () => {
    const failure = run(process.execPath, [getExecutable(), "batiment"]);

    await expect(failure).rejects.toMatchObject({
      stderr: expect.stringContaining("unknown command 'batiment'"),
    });
  },
);

test(
  "the executable rejects `structure`, renamed `batiment map`",
  { timeout: binaryTimeout },
  async () => {
    const failure = run(process.execPath, [getExecutable(), "structure"]);

    await expect(failure).rejects.toMatchObject({
      stderr: expect.stringContaining("unknown command 'structure'"),
    });
  },
);

test(
  "the executable lists every option of a lazy command in its help",
  { timeout: binaryTimeout },
  async () => {
    const {
      stdout,
    } = await run(process.execPath, [getExecutable(), "help", "sync"]);

    expect(stdout).toContain("--check");
    expect(stdout).toContain("--vscode-settings");
  },
);
