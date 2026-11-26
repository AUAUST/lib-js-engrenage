import { execFile } from "node:child_process";
import { symlinkSync } from "node:fs";
import { promisify } from "node:util";

import { describe, expect, test } from "vitest";

import { createBuildSources } from "#project/build/operations/createBuildSources";
import { binaryTimeout } from "#tests/utils/binaryTimeout";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";

const run = promisify(execFile);

const operation = import.meta
  .resolve("#workflows/cli/operations/runExecutable");

const store = "node_modules/.pnpm/fixture/node_modules/fixture";
const installed = "../.pnpm/fixture/node_modules/fixture";

const manifest = JSON.stringify({
  name: "fixture",
  type: "module",
  exports: { ".": "./dist/index.mjs" },
});

function createExecutable(copy: string) {
  return `import { runExecutable } from ${JSON.stringify(operation)};

await runExecutable(import.meta.url, async () => {
  console.log(${JSON.stringify(copy)});
});
`;
}

async function runInstalled(linked: boolean) {
  const checkout = createTemporaryProject({
    "package.json": manifest,
    "src/index.ts": "export {};\n",
    "dist/index.mjs": "export {};\n",
    "dist/bin/cli.mjs": createExecutable("checkout build"),
  });

  await createBuildSources({
    root: checkout.root,
    inputs: ["package.json", "src/index.ts"],
  }).write();

  const consumer = createTemporaryProject({
    "package.json": JSON.stringify({ name: "app", type: "module" }),
    [`${store}/package.json`]: manifest,
    [`${store}/dist/index.mjs`]: "export {};\n",
    [`${store}/dist/bin/cli.mjs`]: createExecutable("installed build"),
    ...(linked
      ? {
          ".engrenage/links.json": JSON.stringify({
            fixture: {
              package: "fixture",
              directory: checkout.root,
              installed,
            },
          }),
        }
      : {}),
  });

  symlinkSync(installed, consumer.resolve("node_modules/fixture"));

  const { stdout } = await run(
    process.execPath,
    [consumer.resolve(`${store}/dist/bin/cli.mjs`)],
    {
      cwd: consumer.root,
      env: { ...process.env, NODE_OPTIONS: undefined },
    },
  );

  return stdout.trim().split("\n").at(-1);
}

describe("runExecutable", { timeout: binaryTimeout }, () => {
  test("runs the linked checkout's build instead of the installed build", async () => {
    expect(await runInstalled(true)).toBe("checkout build");
  });

  test("runs the installed build without a link", async () => {
    expect(await runInstalled(false)).toBe("installed build");
  });
});
