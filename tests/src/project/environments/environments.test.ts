import { join } from "node:path";

import { describe, expect, test, vi } from "vitest";

import { loadConfig } from "@auaust/engrenage";

import { createTemporaryProject } from "#tests/utils/createTemporaryProject";

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

    expect(await config.get("src")).toMatchObject({
      active: true,
      dirs: ["src"],
      generated: [],
      discovered: [],
      defines: true,
      globs: ["src/**/*.{ts,tsx}"],
    });

    expect(await config.get("tests")).toMatchObject({
      active: true,
      dirs: ["tests"],
      generated: [],
      discovered: [],
      defines: true,
      globs: ["tests/**/*.{ts,tsx}"],
      files: [
        "**/*.{spec,test}.{ts,tsx}",
        "**/*.{spec,test}.src.{ts,tsx}",
        "**/*.{spec,test}.dist.{ts,tsx}",
      ],
      fixtures: ["**/fixtures/**"],
      coverageDir: "coverage",
    });

    expect(await config.get("bin")).toMatchObject({
      active: false,
      dirs: ["bin"],
      defines: false,
    });

    expect(await config.get("scripts")).toMatchObject({
      active: false,
      dirs: ["scripts"],
      defines: false,
    });

    expect(await config.get("tooling")).toMatchObject({
      active: true,
      dirs: ["tooling"],
      files: ["*.config.ts", ".*.ts"],
      globs: ["*.config.ts", ".*.ts", "tooling/**/*.{ts,tsx}"],
    });

    expect((await config.get("files")).fixtures).toEqual([
      "tests/**/fixtures/**",
    ]);

    expect((await config.get("files")).published).toEqual([
      "src/**/*.{ts,tsx}",
      "bin/**/*.{ts,tsx}",
    ]);

    expect((await config.get("files")).private).toEqual([
      "tests/**/*.{ts,tsx}",
      "scripts/**/*.{ts,tsx}",
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

    expect(await config.get("bin")).toMatchObject({
      active: false,
      dirs: [],
      generated: [],
      discovered: [],
      defines: false,
      globs: [],
    });

    expect(await config.get("tests")).toMatchObject({
      active: false,
      dirs: [],
      files: [],
      fixtures: [],
    });

    expect(await config.get("tooling")).toMatchObject({
      active: false,
      dirs: [],
      files: [],
      globs: [],
    });

    expect((await config.get("files")).published).toEqual([
      "src/**/*.{ts,tsx}",
    ]);
  });

  test("prefix the generated and discovered globs of every environment by its dirs, discovered roles included", async () => {
    const project = createProject(
      `{
        src: { dirs: ["lib", "src"], generated: "types/**" },
        tests: { generated: ["snapshots/**"] },
        scripts: { discovered: { append: "**/*.ts" } },
      }`,
    );

    const config = await loadConfig(project.root);

    expect((await config.get("files")).generated).toEqual([
      "lib/types/**",
      "src/types/**",
      "tests/snapshots/**",
    ]);

    expect((await config.get("files")).discovered).toEqual([
      "tests/**/setup.ts",
      "scripts/**/*.ts",
    ]);
  });

  test("deactivate an environment whose dirs are missing", async () => {
    const project = createProject('{ src: { dirs: ["missing", "present"] } }', {
      "present/.gitkeep": "",
    });

    const config = await loadConfig(project.root);

    expect((await config.get("src")).active).toBe(true);
    expect((await config.get("bin")).active).toBe(false);

    const missing = await loadConfig(
      createProject('{ src: { dirs: "missing" } }').root,
    );

    expect((await missing.get("src")).active).toBe(false);
    expect((await missing.get("src")).dirs).toEqual(["missing"]);
  });

  test("adjust a default list and the TypeScript files", async () => {
    const project = createProject(`{
      typescript: { files: "**/*.ts" },
      tooling: { files: { prepend: "a.ts", exclude: ".*.ts" } },
    }`);

    const config = await loadConfig(project.root);

    expect((await config.get("typescript")).files).toEqual(["**/*.ts"]);

    expect((await config.get("tooling")).files).toEqual([
      "a.ts",
      "*.config.ts",
    ]);

    expect((await config.get("src")).globs).toEqual(["src/**/*.ts"]);
  });
});

describe("environment tsconfigs", () => {
  test("resolve owner and default path, following inherits", async () => {
    const project = createProject(
      '{ preset: "library", scripts: { tsconfig: { inherits: "bin" } } }',
    );

    const config = await loadConfig(project.root);

    expect((await config.get("src")).tsconfig).toMatchObject({
      owner: "src",
      file: "tsconfig.src.json",
      check: true,
    });

    expect((await config.get("scripts")).tsconfig).toMatchObject({
      owner: "bin",
      file: "tsconfig.bin.json",
    });

    expect((await config.get("tooling")).tsconfig).toMatchObject({
      owner: "bin",
    });

    expect((await config.get("tests")).dist.tsconfig).toMatchObject({
      owner: "tests.dist",
      file: "tsconfig.tests.dist.json",
      check: false,
    });
  });

  test("leave an environment without tsconfig when it is false", async () => {
    const project = createProject("{ bin: { tsconfig: false } }");

    const config = await loadConfig(project.root);

    expect((await config.get("bin")).tsconfig.owner).toBeUndefined();

    await expect(
      (await config.get("bin")).tsconfig.path,
    ).resolves.toBeUndefined();
  });

  test("fail on a cycle and on an inheriting environment with other options", async () => {
    const cycle = await loadConfig(
      createProject(
        '{ bin: { tsconfig: { inherits: "scripts" } }, scripts: { tsconfig: { inherits: "bin" } } }',
      ).root,
    );

    await expect(cycle.get("bin")).rejects.toThrow(
      "inherits in a cycle: bin → scripts → bin",
    );

    const conflict = await loadConfig(
      createProject(
        '{ scripts: { tsconfig: { inherits: "bin", lib: ["es2024"] } } }',
      ).root,
    );

    await expect(conflict.get("scripts")).rejects.toThrow(
      "scripts.tsconfig inherits bin and cannot also set lib",
    );
  });

  test("warn when the base tsconfig is not named tsconfig.json", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    const project = createProject(
      '{ typescript: { tsconfig: { path: "tsconfig.base.json" } } }',
      { "tsconfig.base.json": "{}" },
    );

    const config = await loadConfig(project.root);

    expect(await (await config.get("typescript")).tsconfig.path).toBe(
      join(project.root, "tsconfig.base.json"),
    );

    void (await (
      await config.get("typescript")
    ).tsconfig.path);

    expect(warn).toHaveBeenCalledTimes(1);

    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining("tsconfig.base.json"),
    );

    warn.mockRestore();
  });
});
