import { join } from "node:path";

import { afterEach, describe, expect, test, vi } from "vitest";

import { loadConfig } from "#project/config/operations/loadConfig";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { getFixture } from "#tests/utils/getFixture";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("loadConfig", () => {
  test("falls back to defaults and warns once without a config file or package file", async () => {
    vi.resetModules();

    const { loadConfig: loadFreshConfig } =
      await import("#project/config/operations/loadConfig");

    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    const first = createTemporaryProject().root;

    const config = await loadFreshConfig(first);

    await loadFreshConfig(createTemporaryProject().root);

    expect(warn).toHaveBeenCalledExactlyOnceWith(
      `No engrenage config found in ${first}, using defaults`,
    );

    expect(await config.get("root")).toBe(first);
    expect((await config.get("typescript")).files).toEqual(["**/*.{ts,tsx}"]);
    expect((await config.get("files")).generated).toEqual([]);
    expect(await config.get("raw")).toEqual({});
    expect(await config.get("packageJsonPath")).toBeUndefined();
    expect((await config.get("packageJson")).optional.name).toBeUndefined();
    expect((await config.get("tsconfig")).optional.outDir).toBeUndefined();

    await expect(
      async () => (await config.get("tsconfig")).outDir,
    ).rejects.toThrow(`No tsconfig found in ${first}`);

    expect(await config.get("preset")).toBeUndefined();
    expect(await config.get("traits")).toEqual({ published: false });

    expect((await config.get("environment")).hasDependency("valibot")).toBe(
      false,
    );
  });

  test("finds the config in .config/ and in parent directories, up to the nearest package file", async () => {
    const project = createTemporaryProject({
      "package.json": '{ "name": "outer", "type": "module" }',
      ".config/engrenage.config.ts": 'export default { preset: "library" };\n',
      "src/nested/.gitkeep": "",
      "packages/inner/package.json": '{ "name": "inner", "type": "module" }',
      "packages/inner/src/.gitkeep": "",
    });

    const config = await loadConfig(project.resolve("src/nested"));

    expect(await config.get("root")).toBe(project.root);
    expect(await config.get("preset")).toBe("library");
    expect(await config.get("traits")).toEqual({ published: true });

    const inner = await loadConfig(project.resolve("packages/inner/src"));

    expect(await inner.get("root")).toBe(project.resolve("packages/inner"));
    expect(await inner.get("raw")).toEqual({});
  });

  test("resolves a callback config, replaces defaults, appends generated files and infers project values", async () => {
    const root = getFixture("config/custom");

    const config = await loadConfig(root);

    expect(await config.get("raw")).toEqual({
      preset: "library",
      tests: {
        dirs: "test",
      },
      src: {
        generated: ["generated/**"],
      },
    });

    expect(await config.get("preset")).toBe("library");
    expect(await config.get("traits")).toEqual({ published: true });
    expect((await config.get("tests")).dirs).toEqual(["test"]);

    expect((await config.get("files")).fixtures).toEqual([
      "test/**/fixtures/**",
    ]);

    expect((await config.get("files")).generated).toEqual(["src/generated/**"]);
    expect(await (await config.get("build")).outDir).toBe("dist");
    expect((await config.get("packageJson")).name).toBe("custom-fixture");

    expect(
      (await config.get("environment")).hasDependency("custom-fixture"),
    ).toBe(true);

    expect((await config.get("environment")).hasDependency("valibot")).toBe(
      true,
    );

    expect((await config.get("environment")).hasDependency("zod")).toBe(true);

    expect(
      (await config.get("environment")).hasDependency("@auaust/toolkit"),
    ).toBe(false);

    expect((await config.get("tsconfig")).outDir).toBe("dist");
    expect(loadConfig(root)).toBe(loadConfig(root));
  });

  test("reads the configured tsconfig, rejects a missing configured file when read, even under the default name, and follows pending writes", async () => {
    const appConfig =
      'export default { typescript: { tsconfig: { path: "tsconfig.app.json" } } };\n';

    const tsconfig = JSON.stringify({
      compilerOptions: {
        outDir: "build",
      },
    });

    const { root } = createTemporaryProject({
      "engrenage.config.ts": appConfig,
      "tsconfig.app.json": tsconfig,
    });

    const config = await loadConfig(root);

    expect((await config.get("tsconfig")).outDir).toBe("build");
    expect(await (await config.get("build")).outDir).toBe("build");

    const outside = createTemporaryProject({
      "engrenage.config.ts": "export default {};\n",
      "tsconfig.json": JSON.stringify({
        compilerOptions: {
          outDir: "../build",
        },
      }),
    });

    const outsideConfig = await loadConfig(outside.root);

    expect(await (await outsideConfig.get("build")).outDir).toBeUndefined();

    const missing = await loadConfig(
      createTemporaryProject({
        "engrenage.config.ts": appConfig,
      }).root,
    );

    await expect(
      async () => (await missing.get("typescript")).tsconfig.path,
    ).rejects.toThrow(
      `The configured tsconfig.app.json does not exist in ${await missing.get("root")}`,
    );

    await (
      await missing.get("filesystem")
    ).write("tsconfig.app.json", tsconfig);

    expect(await (await missing.get("typescript")).tsconfig.path).toBe(
      join(await missing.get("root"), "tsconfig.app.json"),
    );

    expect((await missing.get("tsconfig")).outDir).toBe("build");

    const explicitDefault = await loadConfig(
      createTemporaryProject({
        "engrenage.config.ts":
          'export default { typescript: { tsconfig: { path: "tsconfig.json" } } };\n',
      }).root,
    );

    await expect(
      async () => (await explicitDefault.get("typescript")).tsconfig.path,
    ).rejects.toThrow("The configured tsconfig.json does not exist");
  });

  test("uses tsconfig.tests.dist.json when present, is undefined when missing and rejects a missing configured dist tsconfig", async () => {
    const root = getFixture("config/custom");

    const config = await loadConfig(root);

    await expect(
      (await config.get("tests")).dist.tsconfig.path,
    ).resolves.toBeUndefined();

    const implicit = createTemporaryProject({
      "engrenage.config.ts": 'export default { preset: "library" };\n',
      "tsconfig.tests.dist.json": "{}",
    }).root;

    const implicitConfig = await loadConfig(implicit);

    expect(await (await implicitConfig.get("tests")).dist.tsconfig.path).toBe(
      join(implicit, "tsconfig.tests.dist.json"),
    );

    const missing = await loadConfig(
      createTemporaryProject({
        "engrenage.config.ts":
          'export default { tests: { dist: { tsconfig: { path: "tsconfig.build.json" } } } };\n',
      }).root,
    );

    await expect(
      async () => (await missing.get("tests")).dist.tsconfig.path,
    ).rejects.toThrow(
      `The configured tsconfig.build.json does not exist in ${await missing.get("root")}`,
    );
  });

  test("resolves existing source files against the root and rejects escaping paths", async () => {
    const root = getFixture("config/custom");

    const config = await loadConfig(root);

    expect(await config.get("packageJsonPath")).toBe(
      join(root, "package.json"),
    );

    expect(await (await config.get("typescript")).tsconfig.path).toBe(
      join(root, "tsconfig.json"),
    );

    await expect(async () => {
      return (await config.get("resolve"))("../outside");
    }).rejects.toThrow("escapes");
  });

  test("places each package cache under the configured cache root", async () => {
    const defaults = createTemporaryProject({
      "package.json": '{ "type": "module" }',
      "engrenage.config.ts": "export default {};\n",
    });

    const moved = createTemporaryProject({
      "package.json": '{ "type": "module" }',
      "engrenage.config.ts": 'export default { cache: { dir: ".cache" } };\n',
    });

    const defaultsConfig = await loadConfig(defaults.root);
    const movedConfig = await loadConfig(moved.root);

    expect((await defaultsConfig.get("cacheFor"))("eslint")).toBe(
      defaults.resolve("node_modules/.cache/eslint"),
    );

    expect((await movedConfig.get("cacheFor"))("@scope/tool")).toBe(
      moved.resolve(".cache/@scope/tool"),
    );
  });
});

describe("traits", () => {
  async function resolve(options: string) {
    const project = createTemporaryProject({
      "package.json": '{ "type": "module" }',
      "engrenage.config.ts": `export default { ${options} };\n`,
      "tests/index.test.ts": "",
    });

    return loadConfig(project.root);
  }

  test("resolves the library preset to the published trait, which brings the dist mode", async () => {
    const library = await resolve('preset: "library"');
    const app = await resolve("");

    expect(await library.get("traits")).toEqual({ published: true });
    expect((await library.get("tests")).dist.tsconfig.owner).toBe("tests.dist");

    expect(await app.get("traits")).toEqual({ published: false });
    expect((await app.get("tests")).dist.tsconfig.owner).toBeUndefined();
  });

  test("lets traits adjust the preset, enabling winning over disabling", async () => {
    const disabled = await resolve(
      'preset: "library", traits: { disable: ["published"] }',
    );

    const enabled = await resolve('traits: { enable: ["published"] }');

    expect(await disabled.get("traits")).toEqual({ published: false });
    expect((await disabled.get("tests")).dist.tsconfig.owner).toBeUndefined();
    expect(await enabled.get("traits")).toEqual({ published: true });
  });
});
