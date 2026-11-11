import { describe, expect, test } from "vitest";

import { createProjectConfig } from "#project/config/index";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { resolveRepository } from "#tools/github/issues/api/operations/resolveRepository";

function createRegistry(repositories?: Record<string, string | false>) {
  const { root } = createTemporaryProject({
    "package.json": JSON.stringify({
      name: "@scope/app",
      repository: "github:scope/app",
      dependencies: { "@scope/lib": "1.0.0", "@other/x": "1.0.0" },
    }),
    "node_modules/@scope/lib/package.json": JSON.stringify({
      name: "@scope/lib",
      repository: "github:scope/lib-js-lib",
    }),
    "node_modules/@other/x/package.json": JSON.stringify({
      name: "@other/x",
      repository: "github:other/x",
    }),
  });

  const config = createProjectConfig({
    root,
    raw: {
      github: { repositories },
    },
    configFile: undefined,
  });

  return { root, config };
}

describe("repository registry", () => {
  test("registers the current package and its installed same-scope dependencies", async () => {
    const { config } = createRegistry();

    const { repositories } = await config.resolve("github");

    expect([...(await repositories())]).toEqual([
      ["app", "scope/app"],
      ["lib", "scope/lib-js-lib"],
    ]);
  });

  test("drops and adds entries from config", async () => {
    const { config } = createRegistry({ lib: false, extra: "o/r" });

    const { repositories } = await config.resolve("github");

    expect([...(await repositories())]).toEqual([
      ["app", "scope/app"],
      ["extra", "o/r"],
    ]);
  });

  test("resolves a short name and fails on an unknown one, listing the registered names", async () => {
    const { root, config } = createRegistry();

    const { repositories } = await config.resolve("github");

    await expect(
      resolveRepository({ root, repositories }, "lib"),
    ).resolves.toBe("scope/lib-js-lib");

    await expect(
      resolveRepository({ root, repositories }, "nope"),
    ).rejects.toThrow("registered: app, lib");
  });

  test("resolves a full repository without building the registry", async () => {
    const { root } = createRegistry();

    await expect(
      resolveRepository(
        {
          root,
          repositories: () => {
            throw new Error("registry built");
          },
        },
        "o/r",
      ),
    ).resolves.toBe("o/r");
  });
});
