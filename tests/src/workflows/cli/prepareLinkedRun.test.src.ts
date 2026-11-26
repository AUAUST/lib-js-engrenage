import { realpathSync, rmSync, symlinkSync } from "node:fs";
import { pathToFileURL } from "node:url";

import { describe, expect, test, vi } from "vitest";

import { createBuildSources } from "#project/build/operations/createBuildSources";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { mockCwd } from "#tests/utils/mockCwd";
import { prepareLinkedRun } from "#workflows/cli/operations/prepareLinkedRun";

const store = "node_modules/.pnpm/fixture/node_modules/fixture";
const installed = "../.pnpm/fixture/node_modules/fixture";

const manifest = JSON.stringify({
  name: "fixture",
  type: "module",
  bin: { fixture: "./dist/bin/cli.mjs" },
});

async function createFixture(linked: boolean) {
  const checkout = createTemporaryProject({
    "package.json": manifest,
    "src/cli.ts": "export {};\n",
    "dist/bin/cli.mjs": "export {};\n",
  });

  const record = createBuildSources({
    root: checkout.root,
    inputs: ["package.json", "src/cli.ts"],
  });

  await record.write();

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
    deferred: pathToFileURL(checkout.resolve("dist/bin/cli.mjs")).href,
  };
}

describe("prepareLinkedRun", () => {
  test("restores a link an install replaced, defers to the checkout's build and runs it on", async () => {
    const stderr = vi.spyOn(process.stderr, "write").mockReturnValue(true);

    const {
      checkout,
      consumer,
      executable,
      deferred,
    } = await createFixture(true);

    expect(await prepareLinkedRun(executable)).toBe(deferred);

    expect(realpathSync(consumer.resolve("node_modules/fixture"))).toBe(
      checkout.root,
    );

    expect(stderr).toHaveBeenCalledWith(
      expect.stringContaining("Restored the linked checkouts"),
    );

    stderr.mockClear();

    expect(await prepareLinkedRun(deferred)).toBeUndefined();

    expect(stderr).not.toHaveBeenCalled();
  });

  test("fails before running a build older than the checkout's sources", async () => {
    vi.spyOn(process.stderr, "write").mockReturnValue(true);

    const { checkout, deferred } = await createFixture(true);

    checkout.write("src/cli.ts", "export const changed = true;\n");

    await expect(prepareLinkedRun(deferred)).rejects.toThrow(
      `The build of the checkout ${checkout.root} linked to fixture is older than its sources, so this run stops before running stale code: run \`pnpm build\` in it`,
    );
  });

  test("fails on a checkout whose build recorded no sources", async () => {
    vi.spyOn(process.stderr, "write").mockReturnValue(true);

    const { checkout, executable } = await createFixture(true);

    rmSync(checkout.resolve(".engrenage/build-sources.json"));

    await expect(prepareLinkedRun(executable)).rejects.toThrow(
      /has no record of the sources its build consumed/u,
    );
  });

  test("runs on silently without a link, and warns when the checkout is missing", async () => {
    const stderr = vi.spyOn(process.stderr, "write").mockReturnValue(true);

    expect(
      await prepareLinkedRun((await createFixture(false)).executable),
    ).toBeUndefined();

    expect(stderr).not.toHaveBeenCalled();

    const { checkout, executable } = await createFixture(true);

    rmSync(checkout.root, { recursive: true, force: true });

    expect(await prepareLinkedRun(executable)).toBeUndefined();

    expect(stderr).toHaveBeenCalledWith(
      expect.stringContaining("engrenage link --remove fixture"),
    );
  });
});
