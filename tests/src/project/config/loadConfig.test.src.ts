import { join } from "node:path";

import { afterEach, describe, expect, test, vi } from "vitest";

import { buildOutDirSection } from "#project/build/index";
import { cacheSection } from "#project/cache/index";
import { loadConfig } from "#project/config/operations/loadConfig";
import { testsSection } from "#project/environments/index";
import {
  environmentSection,
  packageJsonPathSection,
  packageJsonSection,
} from "#project/package/index";
import { presetSection, traitsSection } from "#project/presets/index";
import { filesSection } from "#project/structure/index";
import {
  tsconfigPathSection,
  tsconfigSection,
  typescriptSection,
} from "#project/tsconfig/index";
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

    expect(config.context.root).toBe(first);

    expect((await config.resolve(typescriptSection)).files).toEqual([
      "**/*.{ts,tsx}",
    ]);

    expect((await config.resolve(filesSection)).generated).toEqual([]);
    expect(await config.resolve(packageJsonPathSection)).toBeUndefined();

    expect(
      (await config.resolve(packageJsonSection)).optional.name,
    ).toBeUndefined();

    expect(
      (await config.resolve(tsconfigSection)).optional.outDir,
    ).toBeUndefined();

    await expect(
      async () => (await config.resolve(tsconfigSection)).outDir,
    ).rejects.toThrow(`No tsconfig found in ${first}`);

    expect(await config.resolve(presetSection)).toBeUndefined();
    expect(await config.resolve(traitsSection)).toEqual({ published: false });

    expect(
      (await config.resolve(environmentSection)).hasDependency("valibot"),
    ).toBe(false);
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

    expect(config.context.root).toBe(project.root);
    expect(await config.resolve(presetSection)).toBe("library");
    expect(await config.resolve(traitsSection)).toEqual({ published: true });

    const inner = await loadConfig(project.resolve("packages/inner/src"));

    expect(inner.context.root).toBe(project.resolve("packages/inner"));
    expect(await inner.resolve(presetSection)).toBeUndefined();
  });

  test("resolves a callback config, replaces defaults, appends generated files and infers project values", async () => {
    const root = getFixture("config/custom");

    const config = await loadConfig(root);

    expect(await config.resolve(presetSection)).toBe("library");
    expect(await config.resolve(traitsSection)).toEqual({ published: true });
    expect((await config.resolve(testsSection)).dirs).toEqual(["test"]);

    expect((await config.resolve(filesSection)).fixtures).toEqual([
      "test/**/fixtures/**",
    ]);

    expect((await config.resolve(filesSection)).generated).toEqual([
      "src/generated/**",
    ]);

    expect(await config.resolve(buildOutDirSection)).toBe("dist");

    expect((await config.resolve(packageJsonSection)).name).toBe(
      "custom-fixture",
    );

    expect(
      (await config.resolve(environmentSection)).hasDependency(
        "custom-fixture",
      ),
    ).toBe(true);

    expect(
      (await config.resolve(environmentSection)).hasDependency("valibot"),
    ).toBe(true);

    expect(
      (await config.resolve(environmentSection)).hasDependency("zod"),
    ).toBe(true);

    expect(
      (await config.resolve(environmentSection)).hasDependency(
        "@auaust/toolkit",
      ),
    ).toBe(false);

    expect((await config.resolve(tsconfigSection)).outDir).toBe("dist");
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

    expect((await config.resolve(tsconfigSection)).outDir).toBe("build");
    expect(await config.resolve(buildOutDirSection)).toBe("build");

    const outside = createTemporaryProject({
      "engrenage.config.ts": "export default {};\n",
      "tsconfig.json": JSON.stringify({
        compilerOptions: {
          outDir: "../build",
        },
      }),
    });

    const outsideConfig = await loadConfig(outside.root);

    expect(await outsideConfig.resolve(buildOutDirSection)).toBeUndefined();

    const missing = await loadConfig(
      createTemporaryProject({
        "engrenage.config.ts": appConfig,
      }).root,
    );

    await expect(async () =>
      missing.resolve(tsconfigPathSection),
    ).rejects.toThrow(
      `The configured tsconfig.app.json does not exist in ${missing.context.root}`,
    );

    await missing.context.filesystem.write("tsconfig.app.json", tsconfig);

    expect(await missing.resolve(tsconfigPathSection)).toBe(
      join(missing.context.root, "tsconfig.app.json"),
    );

    expect((await missing.resolve(tsconfigSection)).outDir).toBe("build");

    const explicitDefault = await loadConfig(
      createTemporaryProject({
        "engrenage.config.ts":
          'export default { typescript: { tsconfig: { path: "tsconfig.json" } } };\n',
      }).root,
    );

    await expect(async () =>
      explicitDefault.resolve(tsconfigPathSection),
    ).rejects.toThrow("The configured tsconfig.json does not exist");
  });

  test("uses tsconfig.tests.dist.json when present, is undefined when missing and rejects a missing configured dist tsconfig", async () => {
    const root = getFixture("config/custom");

    const config = await loadConfig(root);

    await expect(
      (await config.resolve(testsSection)).dist.tsconfig.path,
    ).resolves.toBeUndefined();

    const implicit = createTemporaryProject({
      "engrenage.config.ts": 'export default { preset: "library" };\n',
      "tsconfig.tests.dist.json": "{}",
    }).root;

    const implicitConfig = await loadConfig(implicit);

    expect(
      await (
        await implicitConfig.resolve(testsSection)
      ).dist.tsconfig.path,
    ).toBe(join(implicit, "tsconfig.tests.dist.json"));

    const missing = await loadConfig(
      createTemporaryProject({
        "engrenage.config.ts":
          'export default { tests: { dist: { tsconfig: { path: "tsconfig.build.json" } } } };\n',
      }).root,
    );

    await expect(
      async () => (await missing.resolve(testsSection)).dist.tsconfig.path,
    ).rejects.toThrow(
      `The configured tsconfig.build.json does not exist in ${missing.context.root}`,
    );
  });

  test("resolves existing source files against the root and rejects escaping paths", async () => {
    const root = getFixture("config/custom");

    const config = await loadConfig(root);

    expect(await config.resolve(packageJsonPathSection)).toBe(
      join(root, "package.json"),
    );

    expect(await config.resolve(tsconfigPathSection)).toBe(
      join(root, "tsconfig.json"),
    );

    expect(() => {
      return config.context.path("../outside");
    }).toThrow("escapes");
  });

  test("rejects a config exporting neither an object nor a function returning one, naming the file", async () => {
    const project = createTemporaryProject({
      "package.json": "{}",
      "engrenage.config.ts": 'export default "library";\n',
    });

    await expect(loadConfig(project.root)).rejects.toThrow(
      `${project.resolve("engrenage.config.ts")} must export a config object`,
    );
  });

  test("returns the same config until refreshed, then reads the edited config file", async () => {
    const project = createTemporaryProject({
      "package.json": '{ "type": "module" }',
      "engrenage.config.ts": "export default {};\n",
    });

    const config = await loadConfig(project.root);

    expect(await loadConfig(project.root)).toBe(config);

    project.write(
      "engrenage.config.ts",
      'export default { preset: "library" };\n',
    );

    expect(await loadConfig(project.root)).toBe(config);

    loadConfig.refresh(project.root);

    const refreshed = await loadConfig(project.root);

    expect(refreshed).not.toBe(config);
    expect(refreshed.context.filesystem).not.toBe(config.context.filesystem);
    expect(await refreshed.resolve(presetSection)).toBe("library");
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

    expect((await defaultsConfig.resolve(cacheSection)).for("eslint")).toBe(
      defaults.resolve("node_modules/.cache/eslint"),
    );

    expect((await movedConfig.resolve(cacheSection)).for("@scope/tool")).toBe(
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

    expect(await library.resolve(traitsSection)).toEqual({ published: true });

    expect((await library.resolve(testsSection)).dist.tsconfig.owner).toBe(
      "tests.dist",
    );

    expect(await app.resolve(traitsSection)).toEqual({ published: false });

    expect(
      (await app.resolve(testsSection)).dist.tsconfig.owner,
    ).toBeUndefined();
  });

  test("lets traits adjust the preset, enabling winning over disabling", async () => {
    const disabled = await resolve(
      'preset: "library", traits: { disable: ["published"] }',
    );

    const enabled = await resolve('traits: { enable: ["published"] }');

    expect(await disabled.resolve(traitsSection)).toEqual({ published: false });

    expect(
      (await disabled.resolve(testsSection)).dist.tsconfig.owner,
    ).toBeUndefined();

    expect(await enabled.resolve(traitsSection)).toEqual({ published: true });
  });

  test("manages no tests.dist tsconfig set to false, even when published", async () => {
    const config = await resolve(
      'preset: "library", tests: { dist: { tsconfig: false } }',
    );

    expect(
      (await config.resolve(testsSection)).dist.tsconfig.owner,
    ).toBeUndefined();
  });
});
