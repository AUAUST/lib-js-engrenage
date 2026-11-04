import { describe, expect, test } from "vitest";

import { loadConfig } from "#config/utils/loadConfig";
import { createTemporaryProject } from "#tests/helpers/createTemporaryProject";
import { syncAliases } from "#typescript/setup/syncAliases";

async function sync(config: string, files: Record<string, string> = {}) {
  const project = createTemporaryProject({
    "package.json": '{ "name": "project", "type": "module" }',
    "tsconfig.json": "{}",
    "engrenage.config.ts": `export default ${config};\n`,
    "src/index.ts": "",
    "src/utils/index.ts": "",
    "src/types/Thing.ts": "",
    "src/constants.ts": "",
    "tests/a.test.ts": "",
    ...files,
  });

  const resolved = await loadConfig(project.root);

  syncAliases(resolved);

  return {
    read: (file: string) => JSON.parse(resolved.filesystem.read(file) ?? ""),
  };
}

const source = "src: { node: 24 }";

describe("aliases", () => {
  test("generates the root and src aliases of a library, without #data", async () => {
    const { read } = await sync(
      `{ presets: ["library"], ${source}, data: { exports: {} }, aliases: { define: { "#package.json": "./package.json" } } }`,
      { "data/a.json": "{}" },
    );

    expect(read("package.json").imports).toEqual({
      "#constants": "./src/constants.ts",
      "#index": "./src/index.ts",
      "#package.json": "./package.json",
      "#src/*": "./src/*.ts",
      "#tests/*": "./tests/*.ts",
      "#types/*": "./src/types/*.ts",
      "#utils": "./src/utils/index.ts",
      "#utils/*": "./src/utils/*.ts",
    });
  });

  test("fails on a src entry colliding with a root alias", async () => {
    await expect(
      sync(`{ presets: ["library"], ${source} }`, { "src/tests/a.ts": "" }),
    ).rejects.toThrow(/#tests\/\*.*src entry src\/tests/);
  });

  test("writes a bundled app's src aliases to the tsconfig paths, with #data", async () => {
    const { read } = await sync(
      `{ src: { node: 24, bundled: true, aliases: { define: { "$shopify/*": "./shopify/*.ts" } } } }`,
      { "data/a.json": "{}" },
    );

    expect(read("tsconfig.json").compilerOptions.paths).toMatchObject({
      "$shopify/*": ["./shopify/*.ts"],
      "#utils/*": ["./src/utils/*.ts"],
    });

    expect(read("package.json").imports).toMatchObject({
      "#data/*": "./data/*",
    });

    expect(read("package.json").imports).not.toHaveProperty("$shopify/*");
  });

  test("fails on a bundler alias unless the source is bundled", async () => {
    await expect(
      sync(
        `{ src: { node: 24, aliases: { define: { "$shopify/*": "./shopify/*.ts" } } } }`,
      ),
    ).rejects.toThrow(/bundler alias \$shopify\/\*/);
  });

  test("leaves package.json alone when aliases are off", async () => {
    const { read } = await sync(`{ ${source}, aliases: false }`);

    expect(read("package.json").imports).toBeUndefined();
  });
});
