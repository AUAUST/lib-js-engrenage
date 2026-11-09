import { describe, expect, test } from "vitest";

import { createProjectConfig } from "#project/config/index";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";

function createConfig(build: Readonly<Record<string, unknown>> | undefined) {
  return createProjectConfig({
    root: createTemporaryProject({
      "package.json": JSON.stringify({
        name: "build-fixture",
        devDependencies: { tsdown: "*", vite: "*" },
      }),
    }).root,
    raw: build === undefined ? {} : { build },
    configFile: undefined,
  });
}

describe("build.tool", () => {
  test("fails on a name no build tool contributes, naming the active ones", async () => {
    const config = createConfig({ tool: "rollup" });

    await expect(config.resolve("build.tool")).rejects.toThrow(
      'Slot "build.tools" has no entry "rollup"; active entries: tsdown, vite',
    );
  });

  test("fails unset with several build tools active, naming them and the key", async () => {
    const config = createConfig(undefined);

    await expect(config.resolve("build.tool")).rejects.toThrow(
      'Config key "build.tool" is unset, but slot "build.tools" has several active entries: "tsdown" from tools/tsdown, "vite" from tools/vite',
    );
  });
});
