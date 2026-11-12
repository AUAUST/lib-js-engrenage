import { describe, expect, test, vi } from "vitest";

import { loadConfig } from "#project/config/operations/loadConfig";
import { readSharedPnpmRange } from "#project/package/utils/readSharedPnpmRange";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { readTestPnpmVersions } from "#tests/utils/readTestPnpmVersions";
import { syncPackageJson } from "#workflows/sync/setup/syncPackageJson";

vi.mock(import("#project/package/utils/readSharedPnpmRange"), {
  spy: true,
});

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

  await syncPackageJson(resolved);

  return {
    resolved,
    manifest: async () => {
      const filesystem = resolved.context.filesystem;

      return JSON.parse((await filesystem.read("package.json")) ?? "");
    },
  };
}

const library = `{
  preset: "library",
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

    expect(await manifest()).toMatchObject({
      devEngines: {
        runtime: {
          name: "node",
          version: "24",
          onFail: "error",
        },
      },
      engines: {
        node: ">=26",
      },
      bin: {
        cli: "./dist/bin/cli.mjs",
      },
      files: ["dist", "data", "src"],
    });
  });

  test("lists the configured data directories in files", async () => {
    const { manifest } = await sync(
      library.replace("data: {", 'data: { dirs: ["assets", "static"],'),
      {},
    );

    expect((await manifest()).files).toEqual([
      "dist",
      "assets",
      "static",
      "src",
    ]);
  });

  test("keeps the other engines and devEngines keys and leaves bin alone without commands", async () => {
    const { manifest } = await sync(library, {
      bin: {
        other: "./other.js",
      },
      engines: {
        pnpm: ">=11",
        node: ">=1",
      },
      devEngines: {
        packageManager: { name: "pnpm", version: "11" },
      },
    });

    expect(await manifest()).toMatchObject({
      bin: {
        other: "./other.js",
      },
      engines: {
        pnpm: ">=11",
        node: ">=24",
      },
      devEngines: {
        packageManager: {
          name: "pnpm",
          version: "11",
        },
        runtime: {
          name: "node",
          version: "24",
          onFail: "error",
        },
      },
    });
  });

  test("writes the access of a private library to publishConfig", async () => {
    const {
      manifest,
    } = await sync(library.replace("{", '{ visibility: "private",'), {
      publishConfig: { access: "public" },
    });

    expect((await manifest()).publishConfig).toEqual({
      access: "restricted",
    });
  });

  test("only writes devEngines.runtime and private outside the library preset", async () => {
    const { manifest } = await sync(`{ runtime: { node: 24 } }`, {});

    expect(await manifest()).toEqual({
      type: "module",
      private: true,
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

    expect(resolved.context.filesystem.changes()).toEqual([
      { file: "package.json", status: "synced" },
    ]);

    await resolved.context.filesystem.flush();

    await syncPackageJson(resolved);

    expect(resolved.context.filesystem.changes()).toEqual([]);
  });

  test("syncs an inactive src without src.baseline", async () => {
    const project = createTemporaryProject({
      "package.json": JSON.stringify({ type: "module" }),
      "engrenage.config.ts": "export default {};",
    });

    const resolved = await loadConfig(project.root);

    expect((await resolved.resolve("src")).active).toBe(false);
    expect((await resolved.resolve("src")).runtime).toBeUndefined();
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

    expect((await resolved.resolve("src")).runtime).toBeUndefined();
    expect((await resolved.resolve("src")).runtime).toBeUndefined();

    expect(warn).toHaveBeenCalledOnce();

    expect(warn).toHaveBeenCalledWith(
      expect.stringMatching(/src\.baseline is not set.*set it to \d{4}-\d{2}/),
    );

    await syncPackageJson(resolved);

    await resolved.context.filesystem.flush();

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
    const {
      resolved,
      messages,
    } = await warnings(declare(`^${versions.previousMajor}`));

    expect(messages).toEqual([
      expect.stringContaining("engrenage pnpm upgrade"),
    ]);

    expect(messages[0]).toContain(`pnpm ^${versions.previousMajor} is below`);

    expect(
      await resolved.context.filesystem.read("package.json"),
    ).not.toContain(`^${versions.floor}`);
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

  test("fails on an unparseable project specifier", async () => {
    await expect(warnings(declare("latest"))).rejects.toThrow(
      "pnpm latest cannot be compared",
    );
  });

  test("fails on an unparseable shared specifier", async () => {
    vi.mocked(readSharedPnpmRange).mockReturnValue({
      range: "latest",
      floor: "latest",
    });

    await expect(warnings(declare(`^${versions.floor}`))).rejects.toThrow(
      "engrenage's pnpm latest",
    );
  });
});
