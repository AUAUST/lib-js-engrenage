import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { mockCwd } from "#tests/utils/mockCwd";
import { runDefinition } from "#tests/utils/runDefinition";

import barrels from "#scripts/codegen/actions/barrels";
import codegen from "#scripts/codegen/index";

vi.mock("#scripts/codegen/operations/generateRuleTypes", () => {
  throw new Error("Barrel generation must not load rule generation");
});

function createProject(files: Record<string, string>) {
  const project = createTemporaryProject({
    "package.json": JSON.stringify({
      imports: {
        "#config/*": "./config/*.ts",
        "#rules/*": "./src/rules/*.ts",
      },
    }),
    "config/tool/preset.ts": "export const preset = 1;\n",
    ...files,
  });

  mockCwd(project.root);

  return project;
}

beforeEach(() => {
  vi.spyOn(console, "info").mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("support codegen barrels", () => {
  test("repairs stale exports through the registered CLI without loading rule generation", async () => {
    const project = createProject({
      "src/tool/index.ts": [
        "// @barrel /config/tool/*.ts all",
        'export * from "#config/tool/removed";',
        "// @end",
        "",
      ].join("\n"),
    });

    await runDefinition(codegen, "barrels", "tool");

    expect(project.read("src/tool/index.ts")).toBe(
      [
        "// @barrel /config/tool/*.ts all",
        'export * from "#config/tool/preset";',
        "// @end",
        "",
      ].join("\n"),
    );

    await runDefinition(codegen, "barrels", "tool", "--check");

    expect(process.exitCode).toBeUndefined();
  });

  test("re-exports the matched modules in each mode so a later check passes", async () => {
    const project = createProject({
      "src/tool/index.ts": [
        "// @barrel /config/tool/*.ts all",
        "// @barrel /config/tool/*.ts named",
        "// @barrel /config/tool/*.ts types",
        "// @end",
        "",
      ].join("\n"),
    });

    await barrels(["tool"], { check: false });

    expect(project.read("src/tool/index.ts")).toBe(
      [
        "// @barrel /config/tool/*.ts all",
        'export * from "#config/tool/preset";',
        "// @barrel /config/tool/*.ts named",
        'export { preset } from "#config/tool/preset";',
        "// @barrel /config/tool/*.ts types",
        'export type * from "#config/tool/preset";',
        "// @end",
        "",
      ].join("\n"),
    );

    await barrels([], { check: true });

    expect(process.exitCode).toBeUndefined();
  });

  test("matches globs relative to the barrel, or to the root with a leading slash, except the barrel itself", async () => {
    const project = createProject({
      "src/rules/first.ts": "export default 1;\n",
      "src/rules/second.ts": "export default 2;\n",
      "src/rules/types.d.ts": "export {};\n",
      "src/rules/index.ts": "// @barrel *.ts default\n// @end\n",
      "src/all/index.ts": "// @barrel /src/rules/*.ts default\n// @end\n",
    });

    await barrels(["rules", "src/all"], { check: false });

    expect(project.read("src/rules/index.ts")).toBe(
      [
        "// @barrel *.ts default",
        'export { default as first } from "#rules/first";',
        'export { default as second } from "#rules/second";',
        "// @end",
        "",
      ].join("\n"),
    );

    expect(project.read("src/all/index.ts")).toBe(
      [
        "// @barrel /src/rules/*.ts default",
        'export { default as first } from "#rules/first";',
        'export { default as index } from "#rules/index";',
        'export { default as second } from "#rules/second";',
        "// @end",
        "",
      ].join("\n"),
    );
  });

  test("fills entry barrels beside the index of the named directory", async () => {
    const project = createProject({
      "src/tool/index.ts": "// @barrel /config/tool/*.ts named\n// @end\n",
      "src/tool/entry.ts": "// @barrel /config/tool/*.ts types\n// @end\n",
    });

    await barrels(["tool"], { check: false });

    expect(project.read("src/tool/entry.ts")).toBe(
      [
        "// @barrel /config/tool/*.ts types",
        'export type * from "#config/tool/preset";',
        "// @end",
        "",
      ].join("\n"),
    );
  });

  test("orders exports naturally, as the export ordering convention does", async () => {
    const project = createProject({
      "config/tool/preset10.ts": "export const preset10 = 10;\n",
      "config/tool/preset2.ts": "export const preset2 = 2;\n",
      "src/tool/index.ts": "// @barrel /config/tool/*.ts all\n// @end\n",
    });

    await barrels(["tool"], { check: false });

    expect(project.read("src/tool/index.ts")).toBe(
      [
        "// @barrel /config/tool/*.ts all",
        'export * from "#config/tool/preset";',
        'export * from "#config/tool/preset2";',
        'export * from "#config/tool/preset10";',
        "// @end",
        "",
      ].join("\n"),
    );
  });

  test("names default exports sharing one file name after their directories below the glob's static base", async () => {
    const project = createProject({
      "package.json": JSON.stringify({
        imports: {
          "#project/*": "./src/project/*.ts",
          "#tools/*": "./src/tools/*.ts",
        },
      }),
      "src/tools/git/extension.ts": "export default 1;\n",
      "src/project/config/extension.ts": "export default 2;\n",
      "src/all/index.ts": "// @barrel /src/*/*/extension.ts default\n// @end\n",
    });

    await barrels(["src/all"], { check: false });

    expect(project.read("src/all/index.ts")).toBe(
      [
        "// @barrel /src/*/*/extension.ts default",
        'export { default as projectConfig } from "#project/config/extension";',
        'export { default as toolsGit } from "#tools/git/extension";',
        "// @end",
        "",
      ].join("\n"),
    );
  });

  test("rejects a file name repeated among default exports of different file names", async () => {
    createProject({
      "package.json": JSON.stringify({
        imports: { "#src/*": "./src/*.ts" },
      }),
      "src/a/first.ts": "export default 1;\n",
      "src/b/first.ts": "export default 2;\n",
      "src/b/second.ts": "export default 3;\n",
      "src/all/index.ts": "// @barrel /src/*/*.ts default\n// @end\n",
    });

    await expect(barrels(["src/all"], { check: false })).rejects.toThrow(
      'Several modules export "first"',
    );
  });

  test("rejects unknown barrels, unknown modes and names that are not identifiers", async () => {
    createProject({
      "config/tool/kebab-case.ts": "export default 1;\n",
      "src/tool/index.ts": "// @barrel /config/tool/*.ts default\n// @end\n",
      "src/mode/index.ts": "// @barrel /config/tool/*.ts every\n// @end\n",
    });

    await expect(barrels(["missing"], { check: false })).rejects.toThrow(
      'Unknown barrel "missing"',
    );

    await expect(barrels(["mode"], { check: false })).rejects.toThrow(
      "Expected a barrel mode (default, named, all or types) in",
    );

    await expect(barrels(["tool"], { check: false })).rejects.toThrow(
      'cannot be exported as "kebab-case"',
    );
  });
});
