import { execFileSync } from "node:child_process";
import { join } from "node:path";

import { describe, expect, test } from "vitest";

import { loadConfig } from "@auaust/engrenage/extensions";
import { testsetup } from "@auaust/engrenage/roles";

import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { createTestReporter } from "#tests/utils/createTestReporter";

function createProject(config: string, files: Record<string, string> = {}) {
  return createTemporaryProject({
    "package.json": '{ "name": "project", "type": "module" }',
    "engrenage.config.ts": `export default ${config};\n`,
    ...files,
  });
}

describe("environments", () => {
  test("resolve the defaults of every environment", async () => {
    const project = createProject("{}", {
      "src/.gitkeep": "",
      "tests/.gitkeep": "",
    });

    const config = await loadConfig(project.root);

    expect(await config.resolve("src")).toMatchObject({
      active: true,
      dirs: ["src"],
      generated: [],
      discovered: [],
      globs: ["src/**/*{.ts,.mts,.cts}", "src/**/*.tsx"],
    });

    expect(await config.resolve("tests")).toMatchObject({
      active: true,
      dirs: ["tests"],
      generated: [],
      discovered: [],
      globs: ["tests/**/*{.ts,.mts,.cts}", "tests/**/*.tsx"],
      files: [
        "**/*.test.{ts,tsx}",
        "**/*.test.src.{ts,tsx}",
        "**/*.test.dist.{ts,tsx}",
      ],
      fixtures: ["**/fixtures/**"],
      coverageDir: "coverage",
    });

    expect(await config.resolve("bin")).toMatchObject({
      active: false,
      dirs: ["bin"],
    });

    expect(await config.resolve("scripts")).toMatchObject({
      active: false,
      dirs: ["scripts"],
    });

    expect(await config.resolve("tooling")).toMatchObject({
      active: true,
      dirs: ["tooling"],
      rootFiles: ["*.config.ts", ".*.ts"],
      globs: ["*.config.ts", ".*.ts", "tooling/**/*{.ts,.mts,.cts}"],
    });

    expect((await config.resolve("files")).fixtures).toEqual([
      "tests/**/fixtures/**",
    ]);

    expect((await config.resolve("files")).published).toEqual([
      "src/**/*{.ts,.mts,.cts}",
      "src/**/*.tsx",
      "bin/**/*{.ts,.mts,.cts}",
    ]);

    expect((await config.resolve("files")).private).toEqual([
      "tests/**/*{.ts,.mts,.cts}",
      "tests/**/*.tsx",
      "scripts/**/*{.ts,.mts,.cts}",
    ]);
  });

  test("resolve a disabled environment as inactive with empty lists", async () => {
    const project = createProject(
      "{ bin: false, tests: false, tooling: false }",
      {
        "bin/.gitkeep": "",
        "tests/.gitkeep": "",
      },
    );

    const config = await loadConfig(project.root);

    expect(await config.resolve("bin")).toMatchObject({
      active: false,
      dirs: [],
      generated: [],
      discovered: [],
      globs: [],
    });

    expect(await config.resolve("tests")).toMatchObject({
      active: false,
      dirs: [],
      files: [],
      fixtures: [],
    });

    expect(await config.resolve("tooling")).toMatchObject({
      active: false,
      dirs: [],
      rootFiles: [],
      globs: [],
    });

    expect((await config.resolve("files")).published).toEqual([
      "src/**/*{.ts,.mts,.cts}",
      "src/**/*.tsx",
    ]);
  });

  test("prefix the generated and discovered globs of every environment by its dirs, discovered roles included", async () => {
    const project = createProject(
      `{
        src: { dirs: ["lib", "src"], generated: "types/**" },
        tests: { generated: ["snapshots/**"], roles: ${JSON.stringify([testsetup()])} },
        scripts: { discovered: { append: "**/*.ts" } },
      }`,
    );

    const config = await loadConfig(project.root);

    const { generated } = await config.resolve("files");

    expect(
      generated.filter((glob) => {
        return /^(?:lib|src|tests|scripts)\//u.test(glob);
      }),
    ).toEqual(["lib/types/**", "src/types/**", "tests/snapshots/**"]);

    expect((await config.resolve("files")).discovered).toEqual([
      "tests/**/setup.ts",
      "scripts/**/*.ts",
    ]);
  });

  test("deactivate an environment whose dirs are missing", async () => {
    const project = createProject('{ src: { dirs: ["missing", "present"] } }', {
      "present/.gitkeep": "",
    });

    const config = await loadConfig(project.root);

    expect((await config.resolve("src")).active).toBe(true);
    expect((await config.resolve("bin")).active).toBe(false);

    const missing = await loadConfig(
      createProject('{ src: { dirs: "missing" } }').root,
    );

    expect((await missing.resolve("src")).active).toBe(false);
    expect((await missing.resolve("src")).dirs).toEqual(["missing"]);
  });

  test("deactivate an environment whose dirs hold only files Git ignores", async () => {
    const project = createProject("{}", {
      ".gitignore": ".DS_Store\nscripts/cache/\n",
      "scripts/make/.DS_Store": "",
      "scripts/cache/out.ts": "",
      "bin/.DS_Store": "",
      "bin/run.ts": "",
    });

    execFileSync("git", ["init", "--quiet"], {
      cwd: project.root,
      stdio: "pipe",
    });

    const config = await loadConfig(project.root);

    expect((await config.resolve("scripts")).active).toBe(false);
    expect((await config.resolve("bin")).active).toBe(true);
  });

  test("deactivate tooling whose root files Git ignores", async () => {
    const tooling = '{ tooling: { files: ["local.config.ts", "kept.config.ts"] } }';

    const ignored = createProject(tooling, {
      ".gitignore": "local.config.ts\n",
      "local.config.ts": "",
    });

    const kept = createProject(tooling, {
      ".gitignore": "local.config.ts\n",
      "kept.config.ts": "",
    });

    execFileSync("git", ["init", "--quiet"], {
      cwd: ignored.root,
      stdio: "pipe",
    });

    execFileSync("git", ["init", "--quiet"], { cwd: kept.root, stdio: "pipe" });

    const ignoredConfig = await loadConfig(ignored.root);

    const keptConfig = await loadConfig(kept.root);

    expect((await ignoredConfig.resolve("tooling")).active).toBe(false);
    expect((await keptConfig.resolve("tooling")).active).toBe(true);
  });

  test("adjust a default list and the selected languages", async () => {
    const project = createProject(`{
      src: { languages: ["tsx"] },
      tooling: { files: { prepend: "a.ts", exclude: ".*.ts" } },
    }`);

    const config = await loadConfig(project.root);

    expect((await config.resolve("tooling")).rootFiles).toEqual([
      "a.ts",
      "*.config.ts",
    ]);

    expect((await config.resolve("src")).globs).toEqual(["src/**/*.tsx"]);
  });
});

describe("environment tsconfigs", () => {
  test("resolve each default path after its environment", async () => {
    const project = createProject('{ preset: "library" }');

    const config = await loadConfig(project.root);

    const tsconfigs = await config.resolve("environments.tsconfig");

    expect(tsconfigs.src).toMatchObject({
      file: "tsconfig.src.json",
      check: true,
    });

    expect(tsconfigs.tooling).toMatchObject({
      file: "tsconfig.tooling.json",
    });

    expect((await config.resolve("tests")).dist.tsconfig).toMatchObject({
      file: "tsconfig.tests.dist.json",
      check: false,
    });
  });

  test("leave an environment without tsconfig when it is false", async () => {
    const project = createProject(
      "{ environments: { bin: { tsconfig: false } } }",
    );

    const config = await loadConfig(project.root);

    const { bin } = await config.resolve("environments.tsconfig");

    expect(bin?.file).toBeUndefined();

    await expect(bin?.path).resolves.toBeUndefined();
  });

  test("give a registration outside the built-in names its tsconfig", async () => {
    const project = createProject(
      '{ environments: { web: { preset: "src", dirs: ["web"], tsconfig: { check: false } } } }',
    );

    const config = await loadConfig(project.root);

    const { web } = await config.resolve("environments.tsconfig");

    expect(web).toMatchObject({ file: "tsconfig.web.json", check: false });
  });

  test("reject a tsconfig on a registration whose preset has none", async () => {
    const project = createProject(
      "{ environments: { data: { tsconfig: { check: false } } } }",
    );

    const config = await loadConfig(project.root);

    await expect(config.resolve("environments.tsconfig")).rejects.toThrow(
      "environments.data.tsconfig is set, but the preset data of the environment data has no tsconfig",
    );
  });

  test("keep a nested placement's files in the enclosing environment's globs", async () => {
    const project = createProject(
      '{ environments: { web: { preset: "src", dirs: ["src/web"] } } }',
      { "src/web/page.ts": "" },
    );

    const config = await loadConfig(project.root);

    expect((await config.resolve("src")).globs).toContain(
      "src/**/*{.ts,.mts,.cts}",
    );

    expect((await config.resolve("files")).published).toContain(
      "src/**/*{.ts,.mts,.cts}",
    );
  });

  test("warn when the base tsconfig is not named tsconfig.json", async () => {
    const reporter = createTestReporter();

    const project = createProject(
      '{ typescript: { tsconfig: { path: "tsconfig.base.json" } } }',
      { "tsconfig.base.json": "{}" },
    );

    const config = await loadConfig(project.root, { reporter });

    expect(await config.resolve("tsconfigPath")).toBe(
      join(project.root, "tsconfig.base.json"),
    );

    void (await config.resolve("tsconfigPath"));

    expect(reporter.messages).toEqual([
      expect.objectContaining({
        level: "warn",
        text: expect.stringContaining("tsconfig.base.json"),
      }),
    ]);
  });
});
