import { describe, expect, test } from "vitest";

import { createProjectConfig } from "#project/config/index";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { withSourceRuntime } from "#tests/utils/withSourceRuntime";
import { syncTsconfigFiles } from "#tools/typescript/setup/syncTsconfigFiles";

function createProject(devDependencies: Readonly<Record<string, string>>) {
  const project = createTemporaryProject({
    "package.json": JSON.stringify({ name: "build-fixture", devDependencies }),
  });

  return project;
}

function createConfig(
  raw: Readonly<Record<string, unknown>>,
  devDependencies?: Readonly<Record<string, string>>,
) {
  return createProjectConfig({
    root: createProject(devDependencies ?? { tsdown: "*", vite: "*" }).root,
    raw,
    configFile: undefined,
  });
}

describe("build.tool", () => {
  test("fails on a name no build tool contributes, naming the active ones", async () => {
    const config = createConfig({
      build: { tool: "rollup" },
    });

    await expect(config.resolve("build.tool")).rejects.toThrow(
      'Slot "build.tools" has no entry "rollup"; active entries: tsdown, vite',
    );
  });

  test("fails unset with several build tools active, naming them and the key", async () => {
    const config = createConfig({});

    await expect(config.resolve("build.tool")).rejects.toThrow(
      'Config key "build.tool" is unset, but slot "build.tools" has several active entries: "tsdown" from tools/tsdown, "vite" from tools/vite',
    );
  });

  test("resolves the tool the library preset prefers, without the Vite values", async () => {
    const config = createConfig({ preset: "library" });

    const tool = await config.resolve("build.tool");

    expect(tool && tool.name).toBe("tsdown");

    expect((await config.resolve("src")).bundled).toBe(false);
  });

  test("resolves the only active tool when the preferred one is inactive", async () => {
    const config = createConfig({ preset: "library" }, { vite: "*" });

    const tool = await config.resolve("build.tool");

    expect(tool && tool.name).toBe("vite");
  });
});

describe("Vite defaults", () => {
  test("adds vite/client to the src types, bundles the source and outputs to dist", async () => {
    const project = createProject({ vite: "*" });

    project.write("src/index.ts", "");
    project.write("tsconfig.json", "{}");

    const config = createProjectConfig({
      root: project.root,
      raw: withSourceRuntime({
        src: { node: 22 },
      }),
      configFile: undefined,
    });

    expect((await config.resolve("src")).bundled).toBe(true);

    expect(await config.resolve("build.outDir")).toBe("dist");

    await syncTsconfigFiles(config);

    await config.context.filesystem.flush();

    const {
      types,
    } = JSON.parse(project.read("tsconfig.src.json")).compilerOptions;

    expect(types).toEqual(["node", "vite/client"]);
  });
});
