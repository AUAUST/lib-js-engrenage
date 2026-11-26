import { realpathSync, rmSync, symlinkSync } from "node:fs";
import { pathToFileURL } from "node:url";

import { describe, expect, test, vi } from "vitest";

import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { mockCwd } from "#tests/utils/mockCwd";
import { restoreLinkedExecutable } from "#workflows/cli/operations/restoreLinkedExecutable";

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

describe("restoreLinkedExecutable", () => {
  test("restores a link an install replaced and defers to the checkout's executable", async () => {
    const stderr = vi.spyOn(process.stderr, "write").mockReturnValue(true);

    const { checkout, consumer, executable } = createFixture(true);

    const deferred = pathToFileURL(checkout.resolve("dist/bin/cli.mjs")).href;

    expect(await restoreLinkedExecutable(executable)).toBe(deferred);

    expect(realpathSync(consumer.resolve("node_modules/fixture"))).toBe(
      checkout.root,
    );

    expect(stderr).toHaveBeenCalledWith(
      expect.stringContaining("Restored the linked checkouts"),
    );

    stderr.mockClear();

    expect(await restoreLinkedExecutable(deferred)).toBeUndefined();

    expect(stderr).not.toHaveBeenCalled();
  });

  test("runs on silently without a link, and warns when the checkout is missing", async () => {
    const stderr = vi.spyOn(process.stderr, "write").mockReturnValue(true);

    expect(
      await restoreLinkedExecutable(createFixture(false).executable),
    ).toBeUndefined();

    expect(stderr).not.toHaveBeenCalled();

    const { checkout, executable } = createFixture(true);

    rmSync(checkout.root, { recursive: true, force: true });

    expect(await restoreLinkedExecutable(executable)).toBeUndefined();

    expect(stderr).toHaveBeenCalledWith(
      expect.stringContaining("engrenage link --remove fixture"),
    );
  });
});
