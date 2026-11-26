import { execFile } from "node:child_process";
import { promisify } from "node:util";

import { object, parse, string } from "valibot";
import { expect, test } from "vitest";

import { binaryTimeout } from "#tests/utils/binaryTimeout";
import { getExecutable } from "#tests/utils/getExecutable";

import manifest from "#package.json" with { type: "json" };

const run = promisify(execFile);

const reportCompileCache = `
import { getCompileCacheDir } from "node:module";

process.on("exit", () => {
  process.stderr.write(JSON.stringify({
    shared: process.env.NODE_COMPILE_CACHE,
    used: getCompileCacheDir(),
  }));
});
`;

const compileCacheSchema = object({
  shared: string(),
  used: string(),
});

test(
  "the executable hands its compile cache to the processes it spawns",
  { timeout: binaryTimeout },
  async () => {
    const {
      NODE_COMPILE_CACHE: _cache,
      NODE_DISABLE_COMPILE_CACHE: _disabled,
      ...env
    } = process.env;

    const { stderr } = await run(
      process.execPath,
      [
        "--import",
        `data:text/javascript,${encodeURIComponent(reportCompileCache)}`,
        getExecutable(),
        "--version",
      ],
      { env },
    );

    const { shared, used } = parse(compileCacheSchema, JSON.parse(stderr));

    const { stdout } = await run(
      process.execPath,
      ["--print", 'require("node:module").getCompileCacheDir()'],
      {
        env: { ...env, NODE_COMPILE_CACHE: shared },
      },
    );

    expect(stdout.trim()).toBe(used);
  },
);

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
