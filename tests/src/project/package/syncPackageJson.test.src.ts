import { describe, expect, test, vi } from "vitest";

import { loadConfig } from "#project/config/operations/loadConfig";
import { syncPackageJson } from "#project/package/setup/syncPackageJson";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { readTestPnpmVersions } from "#tests/utils/readTestPnpmVersions";

const versions = readTestPnpmVersions();

async function sync(
  config: string,
  manifest: object,
  files: Record<string, string> = {},
) {
  const project = createTemporaryProject({
    "package.json": JSON.stringify({ type: "module", ...manifest }),
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
      type: "module",
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

  test("syncs an inactive src without src.baseline", async () => {
    const project = createTemporaryProject({
      "package.json": JSON.stringify({ type: "module" }),
      "engrenage.config.ts": "export default {};",
    });

    const resolved = await loadConfig(project.root);

    expect(resolved.src.active).toBe(false);
    expect(resolved.src.runtime).toBeUndefined();
    expect(() => syncPackageJson(resolved)).not.toThrow();
  });

  test("syncs an active src without src.baseline, warning and leaving engines out", async () => {
    const warn = vi.spyOn(console, "warn");

    const project = createTemporaryProject({
      "package.json": JSON.stringify({ type: "module" }),
      "engrenage.config.ts": "export default { bin: false };",
      "src/index.ts": "",
    });

    const resolved = await loadConfig(project.root);

    expect(resolved.src.runtime).toBeUndefined();
    expect(resolved.src.runtime).toBeUndefined();

    expect(warn).toHaveBeenCalledOnce();

    expect(warn).toHaveBeenCalledWith(
      expect.stringMatching(/src\.baseline is not set.*set it to \d{4}-\d{2}/),
    );

    syncPackageJson(resolved);
    resolved.filesystem.flush();

    expect(JSON.parse(project.read("package.json"))).not.toHaveProperty(
      "engines",
    );
  });
});

describe("syncPackageJson pnpm warnings", () => {
  function declare(version: string) {
    return {
      devEngines: {
        packageManager: {
          name: "pnpm",
          version,
          onFail: "download",
        },
      },
    };
  }

  async function warnings(manifest: object) {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    const { resolved } = await sync(library, manifest);

    const messages = warn.mock.calls.map(([message]) => String(message));

    return { resolved, messages };
  }

  test("suggests the upgrade command below the range without failing the check", async () => {
    const { resolved, messages } = await warnings(
      declare(`^${versions.previousMajor}`),
    );

    expect(messages).toEqual([
      expect.stringContaining("engrenage pnpm upgrade"),
    ]);

    expect(messages[0]).toContain(`pnpm ^${versions.previousMajor} is below`);

    expect(resolved.filesystem.read("package.json")).not.toContain(
      `^${versions.floor}`,
    );
  });

  test("suggests updating engrenage for a higher major", async () => {
    const { messages } = await warnings(declare(`^${versions.nextMajor}`));

    expect(messages).toEqual([expect.stringContaining("update engrenage")]);
  });

  test("warns below the floor within the major", async () => {
    const { messages } = await warnings(declare(`^${versions.belowFloor}`));

    expect(messages).toEqual([expect.stringContaining("is below")]);
  });

  test("stays silent for engrenage's floor", async () => {
    const { messages } = await warnings(declare(`^${versions.floor}`));

    expect(messages).toEqual([]);
  });

  test("warns about a legacy field below the range and an only-allow script", async () => {
    const { messages } = await warnings({
      packageManager: `pnpm@${versions.previousMajor}`,
      scripts: { preinstall: "npx only-allow pnpm" },
    });

    expect(messages).toHaveLength(3);
  });
});
