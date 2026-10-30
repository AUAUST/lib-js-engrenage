import { join } from "node:path";

import { afterEach, describe, expect, test, vi } from "vitest";

import { loadConfig } from "@auaust/engrenage/config";

import { createTemporaryProject } from "#tests/helpers/createTemporaryProject";
import { getFixture } from "#tests/helpers/getFixture";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("loadConfig", () => {
  test("falls back to defaults and warns once without a config file or package file", async () => {
    vi.resetModules();

    const { loadConfig: loadFreshConfig } =
      await import("@auaust/engrenage/config");

    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    const first = createTemporaryProject().root;

    const config = await loadFreshConfig(first);

    await loadFreshConfig(createTemporaryProject().root);

    expect(warn).toHaveBeenCalledExactlyOnceWith(
      `No engrenage config found in ${first}, using defaults`,
    );

    expect(config.root).toBe(first);
    expect(config.source.dirs).toEqual(["src"]);
    expect(config.bin.dirs).toEqual(["bin"]);
    expect(config.scripts.dirs).toEqual(["scripts"]);
    expect(config.code.files).toEqual(["**/*.{ts,tsx}"]);

    expect(config.test).toEqual({
      dirs: ["tests"],
      files: ["**/*.{test,spec}.{ts,tsx}"],
      fixtureFiles: ["tests/**/fixtures/**"],
      coverageDir: "coverage",
    });

    expect(config.code.generatedFiles).toEqual([]);
    expect(config.raw).toEqual({});
    expect(config.packageJsonPath).toBeUndefined();
    expect(config.packageJson.optional.name).toBeUndefined();
    expect(config.tsconfig.optional.outDir).toBeUndefined();

    expect(() => config.tsconfig.outDir).toThrow(
      `No tsconfig found in ${first}`,
    );

    expect(config.presets).toEqual([]);
    expect(config.environment.hasDependency("valibot")).toBe(false);
  });

  test("finds the config in .config/ and in parent directories, up to the nearest package file", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});

    const project = createTemporaryProject({
      "package.json": '{ "name": "outer", "type": "module" }',
      ".config/engrenage.config.ts":
        'export default { presets: ["library"] };\n',
      "src/nested/.gitkeep": "",
      "packages/inner/package.json": '{ "name": "inner", "type": "module" }',
      "packages/inner/src/.gitkeep": "",
    });

    const config = await loadConfig(project.resolve("src/nested"));

    expect(config.root).toBe(project.root);
    expect(config.presets).toEqual(["library"]);

    const inner = await loadConfig(project.resolve("packages/inner/src"));

    expect(inner.root).toBe(project.resolve("packages/inner"));
    expect(inner.raw).toEqual({});
  });

  test("resolves a callback config, replaces defaults, appends generated files and infers project values", async () => {
    const root = getFixture("config/custom");

    const config = await loadConfig(root);

    expect(config.raw).toEqual({
      presets: ["library"],
      test: {
        dirs: "test",
      },
      code: {
        generatedFiles: ["src/generated/**"],
      },
    });

    expect(config.presets).toEqual(["library"]);
    expect(config.test.dirs).toEqual(["test"]);
    expect(config.test.fixtureFiles).toEqual(["test/**/fixtures/**"]);
    expect(config.code.generatedFiles).toEqual(["src/generated/**"]);
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
      'export default { typescript: { tsconfig: "tsconfig.app.json" } };\n';

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

    expect(() => missing.typescript.tsconfig).toThrow(
      `The configured tsconfig.app.json does not exist in ${missing.root}`,
    );

    missing.filesystem.write("tsconfig.app.json", tsconfig);

    expect(missing.typescript.tsconfig).toBe(
      join(missing.root, "tsconfig.app.json"),
    );

    expect(missing.tsconfig.outDir).toBe("build");

    const explicitDefault = await loadConfig(
      createTemporaryProject({
        "engrenage.config.ts":
          'export default { typescript: { tsconfig: "tsconfig.json" } };\n',
      }).root,
    );

    expect(() => explicitDefault.typescript.tsconfig).toThrow(
      "The configured tsconfig.json does not exist",
    );
  });

  test("uses tsconfig.dist.json when present, falls back to the tsconfig and rejects a missing configured dist tsconfig", async () => {
    const root = getFixture("config/custom");

    const config = await loadConfig(root);

    expect(config.typescript.distTsconfig).toBe(join(root, "tsconfig.json"));

    const implicit = createTemporaryProject({
      "engrenage.config.ts": "export default {};\n",
      "tsconfig.dist.json": "{}",
    }).root;

    const implicitConfig = await loadConfig(implicit);

    expect(implicitConfig.typescript.distTsconfig).toBe(
      join(implicit, "tsconfig.dist.json"),
    );

    const missing = await loadConfig(
      createTemporaryProject({
        "engrenage.config.ts":
          'export default { typescript: { distTsconfig: "tsconfig.build.json" } };\n',
      }).root,
    );

    expect(() => missing.typescript.distTsconfig).toThrow(
      `The configured tsconfig.build.json does not exist in ${missing.root}`,
    );
  });

  test("resolves existing source files against the root and rejects escaping paths", async () => {
    const root = getFixture("config/custom");

    const config = await loadConfig(root);

    expect(config.packageJsonPath).toBe(join(root, "package.json"));
    expect(config.typescript.tsconfig).toBe(join(root, "tsconfig.json"));
    expect(config.git.gitignore).toBeUndefined();
    expect(config.prettier.prettierignore).toBeUndefined();

    expect(() => {
      return config.resolve("../outside");
    }).toThrow("escapes");
  });

  test("places each package cache under the configured cache root", async () => {
    const defaults = createTemporaryProject({
      "package.json": "{}",
      "engrenage.config.ts": "export default {};\n",
    });

    const moved = createTemporaryProject({
      "package.json": "{}",
      "engrenage.config.ts": 'export default { cache: { dir: ".cache" } };\n',
    });

    expect((await loadConfig(defaults.root)).cacheFor("eslint")).toBe(
      defaults.resolve("node_modules/.cache/eslint"),
    );

    expect((await loadConfig(moved.root)).cacheFor("@scope/tool")).toBe(
      moved.resolve(".cache/@scope/tool"),
    );
  });

  test("rejects unknown keys, naming the file and each key path", async () => {
    const root = getFixture("config/invalid");

    const error = loadConfig(root);

    await expect(error).rejects.toThrow(join(root, "engrenage.config.ts"));
    await expect(error).rejects.toThrow("at sources");
    await expect(error).rejects.toThrow("at code.generatd");
  });
});
