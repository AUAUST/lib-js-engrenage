import { execFile } from "node:child_process";
import { pathToFileURL } from "node:url";
import { promisify } from "node:util";

import { describe, expect, test } from "vitest";

import { binaryTimeout } from "#tests/utils/binaryTimeout";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";

const run = promisify(execFile);

const operation = import.meta
  .resolve("#workflows/cli/operations/enableLinkedSource");

const executable = `import { execFileSync } from "node:child_process";

import { enableLinkedSource } from ${JSON.stringify(operation)};

await enableLinkedSource(import.meta.url);

console.log(import.meta.resolve("fixture"));

console.log(execFileSync(process.execPath, ["-p", "process.env.NODE_OPTIONS ?? 'none'"], { encoding: "utf-8" }).trim());
`;

function createFixture(linked: boolean) {
  const checkout = createTemporaryProject({
    "package.json": JSON.stringify({
      name: "fixture",
      type: "module",
      exports: {
        ".": { source: "./src/index.ts", default: "./dist/index.mjs" },
      },
    }),
    "src/index.ts": "export {};\n",
    "dist/index.mjs": "export {};\n",
    "dist/bin/cli.mjs": executable,
  });

  const consumer = createTemporaryProject({
    "package.json": JSON.stringify({ name: "app", type: "module" }),
    ...(linked
      ? {
          ".engrenage/links.json": JSON.stringify({
            fixture: {
              package: "fixture",
              directory: checkout.root,
              installed: "../.pnpm/x",
            },
          }),
        }
      : {}),
  });

  return { checkout, consumer };
}

async function runFrom(linked: boolean) {
  const { checkout, consumer } = createFixture(linked);

  const {
    stdout,
  } = await run(process.execPath, [checkout.resolve("dist/bin/cli.mjs")], {
    cwd: consumer.root,
    env: { ...process.env, NODE_OPTIONS: undefined },
  });

  return { checkout, lines: stdout.trim().split("\n") };
}

describe("enableLinkedSource", { timeout: binaryTimeout }, () => {
  test("resolves the linked package's sources and passes the condition to spawned processes", async () => {
    const { checkout, lines } = await runFrom(true);

    expect(lines).toEqual([
      pathToFileURL(checkout.resolve("src/index.ts")).href,
      "--conditions=source",
    ]);
  });

  test("keeps the build and the environment without a link", async () => {
    const { checkout, lines } = await runFrom(false);

    expect(lines).toEqual([
      pathToFileURL(checkout.resolve("dist/index.mjs")).href,
      "none",
    ]);
  });
});
