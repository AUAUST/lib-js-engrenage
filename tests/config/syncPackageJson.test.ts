import { describe, expect, test } from "vitest";

import { syncPackageJson } from "#config/setup/syncPackageJson";
import { loadConfig } from "#config/utils/loadConfig";
import { createTemporaryProject } from "#tests/helpers/createTemporaryProject";

async function sync(
  config: string,
  manifest: object,
  files: Record<string, string> = {},
) {
  const project = createTemporaryProject({
    "package.json": JSON.stringify(manifest),
    "engrenage.config.ts": `export default ${config};`,
    "src/index.ts": "",
    ...files,
  });

  const resolved = await loadConfig(project.root);

  syncPackageJson(resolved);

  return {
    resolved,
    manifest: () => JSON.parse(resolved.filesystem.read("package.json") ?? ""),
  };
}

const library = `{
  presets: ["library"],
  runtime: { node: 24 },
  src: { node: 24 },
  bin: { node: 26 },
  build: { outDir: "dist" },
  data: { exports: { "./templates/*.md": "data/templates/*.md" } },
}`;

describe("syncPackageJson", () => {
  test("writes the runtime, engines, bin and files fields from the config", async () => {
    const { manifest } = await sync(
      library,
      {
        name: "pkg",
      },
      {
        "bin/cli.ts": "",
      },
    );

    expect(manifest()).toMatchObject({
      devEngines: {
        runtime: {
          name: "node",
          version: "24",
          onFail: "error",
        },
      },
      engines: { node: ">=26" },
      bin: { cli: "./dist/bin/cli.mjs" },
      files: ["dist", "data", "src"],
    });
  });

  test("lists the configured data directories in files", async () => {
    const { manifest } = await sync(
      library.replace("data: {", 'data: { dirs: ["assets", "static"],'),
      {},
    );

    expect(manifest().files).toEqual(["dist", "assets", "static", "src"]);
  });

  test("keeps the other engines and devEngines keys and leaves bin alone without commands", async () => {
    const { manifest } = await sync(library, {
      bin: { other: "./other.js" },
      engines: { pnpm: ">=11", node: ">=1" },
      devEngines: {
        packageManager: { name: "pnpm", version: "11" },
      },
    });

    expect(manifest()).toMatchObject({
      bin: { other: "./other.js" },
      engines: { pnpm: ">=11", node: ">=24" },
      devEngines: {
        packageManager: { name: "pnpm", version: "11" },
        runtime: {
          name: "node",
          version: "24",
          onFail: "error",
        },
      },
    });
  });

  test("only writes devEngines.runtime outside the library preset", async () => {
    const { manifest } = await sync(`{ runtime: { node: 24 } }`, {});

    expect(manifest()).toEqual({
      devEngines: {
        runtime: {
          name: "node",
          version: "24",
          onFail: "error",
        },
      },
    });
  });

  test("reports drift until the file is written", async () => {
    const { resolved } = await sync(library, {});

    expect(resolved.filesystem.changes()).toEqual([
      { file: "package.json", status: "synced" },
    ]);

    resolved.filesystem.flush();
    syncPackageJson(resolved);

    expect(resolved.filesystem.changes()).toEqual([]);
  });
});
