import { execFile } from "node:child_process";
import { pathToFileURL } from "node:url";
import { promisify } from "node:util";

import { describe, expect, test } from "vitest";

import { binaryTimeout } from "#tests/utils/binaryTimeout";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";

const run = promisify(execFile);

const operation = import.meta
  .resolve("#workflows/cli/operations/findSourceExecutable");

const executable = `import { findSourceExecutable } from ${JSON.stringify(operation)};

console.log((await findSourceExecutable(import.meta, "#bin/cli")) ?? "none");
`;

function createPackage() {
  return createTemporaryProject({
    "package.json": JSON.stringify({
      name: "fixture",
      type: "module",
      imports: {
        "#bin/*": "./bin/*.ts",
      },
      exports: {
        ".": { source: "./src/index.ts", default: "./dist/index.mjs" },
      },
    }),
    "src/index.ts": "export {};\n",
    "dist/index.mjs": "export {};\n",
    "bin/cli.ts": executable,
    "dist/bin/cli.mjs": executable,
  });
}

async function runExecutable(file: string, conditions: readonly string[]) {
  const { stdout } = await run(process.execPath, [...conditions, file]);

  return stdout.trim();
}

describe("findSourceExecutable", { timeout: binaryTimeout }, () => {
  test("defers a built executable to its source under the source condition", async () => {
    const fixture = createPackage();

    expect(
      await runExecutable(fixture.resolve("dist/bin/cli.mjs"), [
        "--conditions=source",
      ]),
    ).toBe(pathToFileURL(fixture.resolve("bin/cli.ts")).href);
  });

  test("keeps the built executable without the condition, and the source one with it", async () => {
    const fixture = createPackage();

    expect(await runExecutable(fixture.resolve("dist/bin/cli.mjs"), [])).toBe(
      "none",
    );

    expect(
      await runExecutable(fixture.resolve("bin/cli.ts"), [
        "--conditions=source",
      ]),
    ).toBe("none");
  });
});
