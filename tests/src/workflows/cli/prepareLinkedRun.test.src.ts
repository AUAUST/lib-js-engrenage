import { execFile } from "node:child_process";
import { mkdirSync, realpathSync, rmSync, symlinkSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { promisify } from "node:util";

import { describe, expect, test, vi } from "vitest";

import { binaryTimeout } from "#tests/utils/binaryTimeout";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { mockCwd } from "#tests/utils/mockCwd";
import { enableSourceCondition } from "#workflows/cli/operations/enableSourceCondition";
import { prepareLinkedRun } from "#workflows/cli/operations/prepareLinkedRun";

vi.mock(import("#workflows/cli/operations/enableSourceCondition"), () => {
  return { enableSourceCondition: vi.fn() };
});

const run = promisify(execFile);

const store = "node_modules/.pnpm/fixture/node_modules/fixture";
const installed = "../.pnpm/fixture/node_modules/fixture";

const manifest = JSON.stringify({
  name: "fixture",
  type: "module",
  bin: { fixture: "./dist/bin/cli.mjs" },
});

function createFixture(linked: boolean) {
  const checkout = createTemporaryProject({
    "package.json": manifest,
    "dist/bin/cli.mjs": "export {};\n",
  });

  const consumer = createTemporaryProject({
    "package.json": JSON.stringify({ name: "app", type: "module" }),
    [`${store}/package.json`]: manifest,
    [`${store}/dist/bin/cli.mjs`]: "export {};\n",
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

  mockCwd(consumer.root);

  return {
    checkout,
    consumer,
    executable: pathToFileURL(consumer.resolve(`${store}/dist/bin/cli.mjs`))
      .href,
  };
}

describe("prepareLinkedRun", () => {
  test("restores a link an install replaced and defers to the checkout's executable", async () => {
    const stderr = vi.spyOn(process.stderr, "write").mockReturnValue(true);

    const { checkout, consumer, executable } = createFixture(true);

    const deferred = pathToFileURL(checkout.resolve("dist/bin/cli.mjs")).href;

    expect(await prepareLinkedRun(executable)).toBe(deferred);

    expect(enableSourceCondition).not.toHaveBeenCalled();

    expect(realpathSync(consumer.resolve("node_modules/fixture"))).toBe(
      checkout.root,
    );

    expect(stderr).toHaveBeenCalledWith(
      expect.stringContaining("Restored the linked checkouts"),
    );

    stderr.mockClear();

    expect(await prepareLinkedRun(deferred)).toBeUndefined();

    expect(enableSourceCondition).toHaveBeenCalledOnce();

    expect(stderr).not.toHaveBeenCalled();
  });

  test("runs on silently without a link, and warns when the checkout is missing", async () => {
    const stderr = vi.spyOn(process.stderr, "write").mockReturnValue(true);

    expect(
      await prepareLinkedRun(createFixture(false).executable),
    ).toBeUndefined();

    expect(stderr).not.toHaveBeenCalled();

    const { checkout, executable } = createFixture(true);

    rmSync(checkout.root, { recursive: true, force: true });

    expect(await prepareLinkedRun(executable)).toBeUndefined();

    expect(stderr).toHaveBeenCalledWith(
      expect.stringContaining("engrenage link --remove fixture"),
    );
  });
});

const operation = import.meta
  .resolve("#workflows/cli/operations/prepareLinkedRun");

const executable = `import { execFileSync } from "node:child_process";

import { prepareLinkedRun } from ${JSON.stringify(operation)};

await prepareLinkedRun(import.meta.url);

console.log(import.meta.resolve("fixture"));

console.log(execFileSync(process.execPath, ["-p", "process.env.NODE_OPTIONS ?? 'none'"], { encoding: "utf-8" }).trim());
`;

function createSourceFixture(linked: boolean) {
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

  if (linked) {
    mkdirSync(consumer.resolve("node_modules"));

    symlinkSync(checkout.root, consumer.resolve("node_modules/fixture"));
  }

  return { checkout, consumer };
}

async function runFrom(linked: boolean) {
  const { checkout, consumer } = createSourceFixture(linked);

  const {
    stdout,
  } = await run(process.execPath, [checkout.resolve("dist/bin/cli.mjs")], {
    cwd: consumer.root,
    env: { ...process.env, NODE_OPTIONS: undefined },
  });

  return { checkout, lines: stdout.trim().split("\n") };
}

describe(
  "prepareLinkedRun in a linked checkout",
  { timeout: binaryTimeout },
  () => {
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
  },
);
