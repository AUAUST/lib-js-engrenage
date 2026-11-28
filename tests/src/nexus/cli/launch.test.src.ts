import { execFile } from "node:child_process";
import { promisify } from "node:util";

import { describe, expect, test } from "vitest";

import { binaryTimeout } from "#tests/utils/binaryTimeout";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";

const run = promisify(execFile);

const surface = import.meta.resolve("#nexus/cli/index");

function createExecutable(options: string) {
  return `import { getCompileCacheDir } from "node:module";

import { command, launch, program } from ${JSON.stringify(surface)};

process.on("exit", () => {
  process.stderr.write(String(getCompileCacheDir()));
});

await launch(async () => {
  return { program: program({ root: command({ name: "cli", version: "1.2.3", action: () => Promise.resolve(() => {}) }) }) };
}, ${options});
`;
}

async function launchVersion(options: string) {
  const project = createTemporaryProject({
    "cli.mjs": createExecutable(options),
  });

  const {
    NODE_COMPILE_CACHE: _cache,
    NODE_DISABLE_COMPILE_CACHE: _disabled,
    ...env
  } = process.env;

  return run(process.execPath, [project.resolve("cli.mjs"), "--version"], {
    env: { ...env, NODE_OPTIONS: undefined },
  });
}

describe("launch", { timeout: binaryTimeout }, () => {
  test("runs the loaded program with the compile cache on", async () => {
    const { stdout, stderr } = await launchVersion("{}");

    expect(stdout.trim()).toBe("1.2.3");
    expect(stderr).not.toBe("undefined");
  });

  test("leaves the compile cache off when opted out", async () => {
    const { stdout, stderr } = await launchVersion("{ compileCache: false }");

    expect(stdout.trim()).toBe("1.2.3");
    expect(stderr).toBe("undefined");
  });
});
