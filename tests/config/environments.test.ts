import { describe, expect, test } from "vitest";

import { loadConfig } from "@auaust/engrenage/config";

import { createTemporaryProject } from "#tests/helpers/createTemporaryProject";

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

    expect(config.src).toEqual({
      active: true,
      dirs: ["src"],
      generated: [],
      discovered: [],
      defines: true,
      globs: ["src/**/*.{ts,tsx}"],
    });

    expect(config.tests).toEqual({
      active: true,
      dirs: ["tests"],
      generated: [],
      discovered: [],
      defines: true,
      globs: ["tests/**/*.{ts,tsx}"],
      files: ["**/*.{test,spec}.{ts,tsx}"],
      fixtures: ["**/fixtures/**"],
      coverageDir: "coverage",
    });

    expect(config.bin).toMatchObject({
      active: false,
      dirs: ["bin"],
      defines: false,
    });

    expect(config.scripts).toMatchObject({
      active: false,
      dirs: ["scripts"],
      defines: false,
    });

    expect(config.tooling).toEqual({
      active: true,
      dirs: ["."],
      files: ["*.config.ts", ".*.ts"],
      globs: ["*.config.ts", ".*.ts"],
    });

    expect(config.files.fixtures).toEqual(["tests/**/fixtures/**"]);

    expect(config.files.published).toEqual([
      "src/**/*.{ts,tsx}",
      "bin/**/*.{ts,tsx}",
    ]);

    expect(config.files.private).toEqual([
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

    expect(config.bin).toEqual({
      active: false,
      dirs: [],
      generated: [],
      discovered: [],
      defines: false,
      globs: [],
    });

    expect(config.tests).toMatchObject({
      active: false,
      dirs: [],
      files: [],
      fixtures: [],
    });

    expect(config.tooling).toEqual({
      active: false,
      dirs: [],
      files: [],
      globs: [],
    });

    expect(config.files.published).toEqual(["src/**/*.{ts,tsx}"]);
  });

  test("prefix the generated and discovered globs of every environment by its dirs", async () => {
    const project = createProject(
      `{
        src: { dirs: ["lib", "src"], generated: "types/**" },
        tests: { generated: ["snapshots/**"] },
        scripts: { discovered: { append: "**/*.ts" } },
      }`,
    );

    const config = await loadConfig(project.root);

    expect(config.files.generated).toEqual([
      "lib/types/**",
      "src/types/**",
      "tests/snapshots/**",
    ]);

    expect(config.files.discovered).toEqual(["scripts/**/*.ts"]);
  });

  test("deactivate an environment whose dirs are missing", async () => {
    const project = createProject('{ src: { dirs: ["missing", "present"] } }', {
      "present/.gitkeep": "",
    });

    const config = await loadConfig(project.root);

    expect(config.src.active).toBe(true);
    expect(config.bin.active).toBe(false);

    const missing = await loadConfig(
      createProject('{ src: { dirs: "missing" } }').root,
    );

    expect(missing.src.active).toBe(false);
    expect(missing.src.dirs).toEqual(["missing"]);
  });

  test("adjust a default list and the TypeScript files", async () => {
    const project = createProject(`{
      typescript: { files: "**/*.ts" },
      tooling: { files: { prepend: "a.ts", exclude: ".*.ts" } },
    }`);

    const config = await loadConfig(project.root);

    expect(config.typescript.files).toEqual(["**/*.ts"]);
    expect(config.tooling.files).toEqual(["a.ts", "*.config.ts"]);
    expect(config.src.globs).toEqual(["src/**/*.ts"]);
  });
});
