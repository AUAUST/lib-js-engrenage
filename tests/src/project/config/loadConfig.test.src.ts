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

    expect(config.root).toBe(first);
    expect(config.typescript.files).toEqual(["**/*.{ts,tsx}"]);
    expect(config.files.generated).toEqual([]);
    expect(config.raw).toEqual({});
    expect(config.packageJsonPath).toBeUndefined();
    expect(config.packageJson.optional.name).toBeUndefined();
    expect(config.tsconfig.optional.outDir).toBeUndefined();

    expect(() => config.tsconfig.outDir).toThrow(
      `No tsconfig found in ${first}`,
    );

    expect(config.preset).toBeUndefined();
    expect(config.traits).toEqual({ published: false });
    expect(config.environment.hasDependency("valibot")).toBe(false);
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

    expect(config.root).toBe(project.root);
    expect(config.preset).toBe("library");
    expect(config.traits).toEqual({ published: true });

    const inner = await loadConfig(project.resolve("packages/inner/src"));

    expect(inner.root).toBe(project.resolve("packages/inner"));
    expect(inner.raw).toEqual({});
  });

  test("resolves a callback config, replaces defaults, appends generated files and infers project values", async () => {
    const root = getFixture("config/custom");

    const config = await loadConfig(root);

    expect(config.raw).toEqual({
      preset: "library",
      tests: {
        dirs: "test",
      },
      src: {
        generated: ["generated/**"],
      },
    });

    expect(config.preset).toBe("library");
    expect(config.traits).toEqual({ published: true });
    expect(config.tests.dirs).toEqual(["test"]);
    expect(config.files.fixtures).toEqual(["test/**/fixtures/**"]);
    expect(config.files.generated).toEqual(["src/generated/**"]);
    expect(config.build.outDir).toBe("dist");
    expect(config.packageJson.name).toBe("custom-fixture");
    expect(config.environment.hasDependency("custom-fixture")).toBe(true);
    expect(config.environment.hasDependency("valibot")).toBe(true);
    expect(config.environment.hasDependency("zod")).toBe(true);
    expect(config.environment.hasDependency("@auaust/toolkit")).toBe(false);
    expect(config.tsconfig.outDir).toBe("dist");
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

    expect(config.tsconfig.outDir).toBe("build");
    expect(config.build.outDir).toBe("build");

    const outside = createTemporaryProject({
      "engrenage.config.ts": "export default {};\n",
      "tsconfig.json": JSON.stringify({
        compilerOptions: {
          outDir: "../build",
        },
      }),
    });

    const outsideConfig = await loadConfig(outside.root);

    expect(outsideConfig.build.outDir).toBeUndefined();

    const missing = await loadConfig(
      createTemporaryProject({
        "engrenage.config.ts": appConfig,
      }).root,
    );

    expect(() => missing.typescript.tsconfig.path).toThrow(
      `The configured tsconfig.app.json does not exist in ${missing.root}`,
    );

    missing.filesystem.write("tsconfig.app.json", tsconfig);

    expect(missing.typescript.tsconfig.path).toBe(
      join(missing.root, "tsconfig.app.json"),
    );

    expect(missing.tsconfig.outDir).toBe("build");

    const explicitDefault = await loadConfig(
      createTemporaryProject({
        "engrenage.config.ts":
          'export default { typescript: { tsconfig: { path: "tsconfig.json" } } };\n',
      }).root,
    );

    expect(() => explicitDefault.typescript.tsconfig.path).toThrow(
      "The configured tsconfig.json does not exist",
    );
  });

  test("uses tsconfig.tests.dist.json when present, is undefined when missing and rejects a missing configured dist tsconfig", async () => {
    const root = getFixture("config/custom");

    const config = await loadConfig(root);

    expect(config.tests.dist.tsconfig.path).toBeUndefined();

    const implicit = createTemporaryProject({
      "engrenage.config.ts": 'export default { preset: "library" };\n',
      "tsconfig.tests.dist.json": "{}",
    }).root;

    const implicitConfig = await loadConfig(implicit);

    expect(implicitConfig.tests.dist.tsconfig.path).toBe(
      join(implicit, "tsconfig.tests.dist.json"),
    );

    const missing = await loadConfig(
      createTemporaryProject({
        "engrenage.config.ts":
          'export default { tests: { dist: { tsconfig: { path: "tsconfig.build.json" } } } };\n',
      }).root,
    );

    expect(() => missing.tests.dist.tsconfig.path).toThrow(
      `The configured tsconfig.build.json does not exist in ${missing.root}`,
    );
  });

  test("resolves existing source files against the root and rejects escaping paths", async () => {
    const root = getFixture("config/custom");

    const config = await loadConfig(root);

    expect(config.packageJsonPath).toBe(join(root, "package.json"));
    expect(config.typescript.tsconfig.path).toBe(join(root, "tsconfig.json"));

    expect(() => {
      return config.resolve("../outside");
    }).toThrow("escapes");
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

    expect((await loadConfig(defaults.root)).cacheFor("eslint")).toBe(
      defaults.resolve("node_modules/.cache/eslint"),
    );

    expect((await loadConfig(moved.root)).cacheFor("@scope/tool")).toBe(
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

    expect(library.traits).toEqual({ published: true });
    expect(library.tests.dist.tsconfig.owner).toBe("tests.dist");

    expect(app.traits).toEqual({ published: false });
    expect(app.tests.dist.tsconfig.owner).toBeUndefined();
  });

  test("lets traits adjust the preset, enabling winning over disabling", async () => {
    const disabled = await resolve(
      'preset: "library", traits: { disable: ["published"] }',
    );

    const enabled = await resolve('traits: { enable: ["published"] }');

    expect(disabled.traits).toEqual({ published: false });
    expect(disabled.tests.dist.tsconfig.owner).toBeUndefined();
    expect(enabled.traits).toEqual({ published: true });
  });
});
