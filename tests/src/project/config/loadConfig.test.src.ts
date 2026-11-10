import { join } from "node:path";

import { describe, expect, test } from "vitest";

import { createProjectConfig } from "#project/config/operations/createProjectConfig";
import { loadConfig } from "#project/config/operations/loadConfig";
import { readRawConfig } from "#project/config/operations/readRawConfig";
import { validateConfig } from "#project/config/operations/validateConfig";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { getFixture } from "#tests/utils/getFixture";
import type { Resolver } from "#foundation/options/index";
import type { ConfigContext } from "#project/config/types/ConfigContext";

describe("loadConfig", () => {
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
    expect(await config.resolve("preset")).toMatchObject({ name: "library" });
    expect(await config.resolve("traits")).toEqual({ published: true });

    const inner = await loadConfig(project.resolve("packages/inner/src"));

    expect(inner.context.root).toBe(project.resolve("packages/inner"));
    expect(await inner.resolve("preset")).toBe(false);
  });

  test("resolves a callback config, replaces defaults, appends generated files and infers project values", async () => {
    const root = getFixture("config/custom");

    const config = await loadConfig(root);

    expect(await config.resolve("preset")).toMatchObject({ name: "library" });
    expect(await config.resolve("traits")).toEqual({ published: true });
    expect((await config.resolve("tests")).dirs).toEqual(["test"]);

    expect((await config.resolve("files")).fixtures).toEqual([
      "test/**/fixtures/**",
    ]);

    expect((await config.resolve("files")).generated).toEqual([
      "src/generated/**",
    ]);

    expect(await config.resolve("build.outDir")).toBe("dist");

    expect((await config.resolve("packageJson")).name).toBe("custom-fixture");

    expect(
      (await config.resolve("environment")).hasDependency("custom-fixture"),
    ).toBe(true);

    expect((await config.resolve("environment")).hasDependency("valibot")).toBe(
      true,
    );

    expect((await config.resolve("environment")).hasDependency("zod")).toBe(
      true,
    );

    expect(
      (await config.resolve("environment")).hasDependency("@auaust/toolkit"),
    ).toBe(false);

    expect((await config.resolve("tsconfig")).outDir).toBe("dist");
    expect(loadConfig(root)).toBe(loadConfig(root));
  });

  test("reads the configured tsconfig, rejects a missing configured file when read, even under the default name, and follows pending writes", async () => {
    const appConfig = 'export default { typescript: { tsconfig: { path: "tsconfig.app.json" } } };\n';

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

    expect((await config.resolve("tsconfig")).outDir).toBe("build");
    expect(await config.resolve("build.outDir")).toBe("build");

    const outside = createTemporaryProject({
      "engrenage.config.ts": "export default {};\n",
      "tsconfig.json": JSON.stringify({
        compilerOptions: {
          outDir: "../build",
        },
      }),
    });

    const outsideConfig = await loadConfig(outside.root);

    expect(await outsideConfig.resolve("build.outDir")).toBeUndefined();

    const missing = await loadConfig(
      createTemporaryProject({
        "engrenage.config.ts": appConfig,
      }).root,
    );

    await expect(async () => missing.resolve("tsconfigPath")).rejects.toThrow(
      `The configured tsconfig.app.json does not exist in ${missing.context.root}`,
    );

    await missing.context.filesystem.write("tsconfig.app.json", tsconfig);

    expect(await missing.resolve("tsconfigPath")).toBe(
      join(missing.context.root, "tsconfig.app.json"),
    );

    expect((await missing.resolve("tsconfig")).outDir).toBe("build");

    const explicitDefault = await loadConfig(
      createTemporaryProject({
        "engrenage.config.ts": 'export default { typescript: { tsconfig: { path: "tsconfig.json" } } };\n',
      }).root,
    );

    await expect(async () => {
      return explicitDefault.resolve("tsconfigPath");
    }).rejects.toThrow("The configured tsconfig.json does not exist");
  });

  test("uses tsconfig.tests.dist.json when present, is undefined when missing and rejects a missing configured dist tsconfig", async () => {
    const root = getFixture("config/custom");

    const config = await loadConfig(root);

    await expect(
      (await config.resolve("tests")).dist.tsconfig.path,
    ).resolves.toBeUndefined();

    const implicit = createTemporaryProject({
      "engrenage.config.ts": 'export default { preset: "library" };\n',
      "tsconfig.tests.dist.json": "{}",
    }).root;

    const implicitConfig = await loadConfig(implicit);

    expect(
      await (
        await implicitConfig.resolve("tests")
      ).dist.tsconfig.path,
    ).toBe(join(implicit, "tsconfig.tests.dist.json"));

    const missing = await loadConfig(
      createTemporaryProject({
        "engrenage.config.ts": 'export default { tests: { dist: { tsconfig: { path: "tsconfig.build.json" } } } };\n',
      }).root,
    );

    await expect(
      async () => (await missing.resolve("tests")).dist.tsconfig.path,
    ).rejects.toThrow(
      `The configured tsconfig.build.json does not exist in ${missing.context.root}`,
    );
  });

  test("resolves existing source files against the root and rejects escaping paths", async () => {
    const root = getFixture("config/custom");

    const config = await loadConfig(root);

    expect(await config.resolve("packageJsonPath")).toBe(
      join(root, "package.json"),
    );

    expect(await config.resolve("tsconfigPath")).toBe(
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

    expect(await refreshed.resolve("preset")).toMatchObject({
      name: "library",
    });
  });

  test("registers a listed extension after every built-in", async () => {
    const config = await loadConfig(getFixture("projects/external"), {
      searchParents: false,
    });

    const { registry } = config.context;

    const owner = registry.owner("slots", "externalFixture.entries");

    expect(owner?.name).toBe("external-fixture");
    expect(registry.extensions.at(-1)).toBe(owner);
  });

  test("reads the key of a listed extension through the open resolver", async () => {
    const config: Resolver<ConfigContext> = await loadConfig(
      getFixture("projects/external"),
      { searchParents: false },
    );

    expect(await config.resolve("externalFixture")).toEqual({
      label: "listed",
    });
  });

  test("locates the file resources of a listed extension and of the built-ins", async () => {
    const fixture = getFixture("projects/external");

    const config = await loadConfig(fixture, { searchParents: false });

    const resources = await config.resolve("resources");

    expect(resources.get("externalFixture.output")).toMatchObject({
      owner: "external-fixture",
      title: "External fixture",
      committed: false,
    });

    expect(resources.path("cache.gate")).toBe(
      join(fixture, "node_modules/.cache/gate"),
    );
  });

  test("validates the input of a listed extension's key", async () => {
    const fixture = getFixture("projects/external");

    const config = await loadConfig(fixture, { searchParents: false });

    await expect(validateConfig(config)).resolves.toBe(config);

    const { root, raw } = await readRawConfig(fixture, {
      searchParents: false,
    });

    const invalid = createProjectConfig({
      root,
      raw: {
        ...raw,
        externalFixture: { label: 1 },
      },
      configFile: undefined,
    });

    await expect(validateConfig(invalid)).rejects.toThrow("externalFixture");
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

    expect((await defaultsConfig.resolve("cache")).for("eslint")).toBe(
      defaults.resolve("node_modules/.cache/eslint"),
    );

    expect((await movedConfig.resolve("cache")).for("@scope/tool")).toBe(
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

    expect(await library.resolve("traits")).toEqual({ published: true });

    expect((await library.resolve("tests")).dist.tsconfig.owner).toBe(
      "tests.dist",
    );

    expect(await app.resolve("traits")).toEqual({ published: false });

    expect((await app.resolve("tests")).dist.tsconfig.owner).toBeUndefined();
  });

  test("lets traits adjust the preset, enabling winning over disabling", async () => {
    const disabled = await resolve(
      'preset: "library", traits: { disable: ["published"] }',
    );

    const enabled = await resolve('traits: { enable: ["published"] }');

    expect(await disabled.resolve("traits")).toEqual({ published: false });

    expect(
      (await disabled.resolve("tests")).dist.tsconfig.owner,
    ).toBeUndefined();

    expect(await enabled.resolve("traits")).toEqual({ published: true });
  });

  test("manages no tests.dist tsconfig set to false, even when published", async () => {
    const config = await resolve(
      'preset: "library", tests: { dist: { tsconfig: false } }',
    );

    expect((await config.resolve("tests")).dist.tsconfig.owner).toBeUndefined();
  });
});
