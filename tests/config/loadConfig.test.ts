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
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    const first = createTemporaryProject().root;

    const config = await loadConfig(first);

    await loadConfig(createTemporaryProject().root);

    expect(warn).toHaveBeenCalledExactlyOnceWith(
      `No engrenage config found in ${first}, using defaults`,
    );
    expect(config.root).toBe(first);
    expect(config.directories).toEqual({
      source: ["src", "bin", "scripts"],
      test: ["tests"],
      coverage: "coverage",
    });
    expect(config.files.generated).toEqual([]);
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
      directories: {
        test: ["test"],
      },
      files: {
        generated: ["src/generated/**"],
      },
    });
    expect(config.presets).toEqual(["library"]);
    expect(config.directories.test).toEqual(["test"]);
    expect(config.files.generated).toEqual(["src/generated/**"]);
    expect(config.directories.output).toBe("dist");
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
      'export default { files: { tsconfig: "tsconfig.app.json" } };\n';

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
    expect(config.directories.output).toBe("build");

    const outside = createTemporaryProject({
      "engrenage.config.ts": "export default {};\n",
      "tsconfig.json": JSON.stringify({
        compilerOptions: {
          outDir: "../build",
        },
      }),
    });

    expect((await loadConfig(outside.root)).directories.output).toBeUndefined();

    const missing = await loadConfig(
      createTemporaryProject({
        "engrenage.config.ts": appConfig,
      }).root,
    );

    expect(() => missing.tsconfigPath).toThrow(
      `The configured tsconfig.app.json does not exist in ${missing.root}`,
    );

    missing.filesystem.write("tsconfig.app.json", tsconfig);

    expect(missing.tsconfigPath).toBe(join(missing.root, "tsconfig.app.json"));
    expect(missing.tsconfig.outDir).toBe("build");

    const explicitDefault = await loadConfig(
      createTemporaryProject({
        "engrenage.config.ts":
          'export default { files: { tsconfig: "tsconfig.json" } };\n',
      }).root,
    );

    expect(() => explicitDefault.tsconfigPath).toThrow(
      "The configured tsconfig.json does not exist",
    );
  });

  test("uses tsconfig.dist.json when present, falls back to the tsconfig and rejects a missing configured dist tsconfig", async () => {
    const root = getFixture("config/custom");

    const config = await loadConfig(root);

    expect(config.distTsconfigPath).toBe(join(root, "tsconfig.json"));

    const implicit = createTemporaryProject({
      "engrenage.config.ts": "export default {};\n",
      "tsconfig.dist.json": "{}",
    }).root;

    const implicitConfig = await loadConfig(implicit);

    expect(implicitConfig.distTsconfigPath).toBe(
      join(implicit, "tsconfig.dist.json"),
    );

    const missing = await loadConfig(
      createTemporaryProject({
        "engrenage.config.ts":
          'export default { files: { distTsconfig: "tsconfig.build.json" } };\n',
      }).root,
    );

    expect(() => missing.distTsconfigPath).toThrow(
      `The configured tsconfig.build.json does not exist in ${missing.root}`,
    );
  });

  test("resolves existing source files against the root and rejects escaping paths", async () => {
    const root = getFixture("config/custom");

    const config = await loadConfig(root);

    expect(config.packageJsonPath).toBe(join(root, "package.json"));
    expect(config.tsconfigPath).toBe(join(root, "tsconfig.json"));
    expect(config.gitignorePath).toBeUndefined();
    expect(config.prettierignorePath).toBeUndefined();
    expect(() => {
      return config.resolve("../outside");
    }).toThrow("escapes");
  });

  test("rejects unknown keys, naming the file and each key path", async () => {
    const root = getFixture("config/invalid");

    const error = loadConfig(root);

    await expect(error).rejects.toThrow(join(root, "engrenage.config.ts"));
    await expect(error).rejects.toThrow("at sources");
    await expect(error).rejects.toThrow("at files.generatd");
  });
});
