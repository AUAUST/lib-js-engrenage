import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import barrels from "#scripts/support/codegen/barrels";
import { createTemporaryProject } from "#tests/helpers/createTemporaryProject";
import { mockCwd } from "#tests/helpers/mockCwd";
import { runCommand } from "#tests/helpers/runCommand";

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
  vi.spyOn(console, "warn").mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();

  process.exitCode = undefined;
});

describe("support codegen barrels", () => {
  test("re-exports the matched modules in each mode so a later check passes", async () => {
    const project = createProject({
      "src/tool/index.ts": [
        "// @barrel /config/tool/*.ts all",
        "// @barrel /config/tool/*.ts named",
        "// @end",
        "",
      ].join("\n"),
    });

    await runCommand(barrels, "tool");

    expect(project.read("src/tool/index.ts")).toBe(
      [
        "// @barrel /config/tool/*.ts all",
        'export * from "#config/tool/preset";',
        "// @barrel /config/tool/*.ts named",
        'export { preset } from "#config/tool/preset";',
        "// @end",
        "",
      ].join("\n"),
    );

    await runCommand(barrels, "--check");

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

    await runCommand(barrels, "rules", "src/all");

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

  test("orders exports naturally, as the export ordering convention does", async () => {
    const project = createProject({
      "config/tool/preset10.ts": "export const preset10 = 10;\n",
      "config/tool/preset2.ts": "export const preset2 = 2;\n",
      "src/tool/index.ts": "// @barrel /config/tool/*.ts all\n// @end\n",
    });

    await runCommand(barrels, "tool");

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

  test("rejects unknown barrels, unknown modes and names that are not identifiers", async () => {
    createProject({
      "config/tool/kebab-case.ts": "export default 1;\n",
      "src/tool/index.ts": "// @barrel /config/tool/*.ts default\n// @end\n",
      "src/mode/index.ts": "// @barrel /config/tool/*.ts every\n// @end\n",
    });

    await expect(runCommand(barrels, "missing")).rejects.toThrow(
      'Unknown barrel "missing"',
    );

    await expect(runCommand(barrels, "mode")).rejects.toThrow(
      "Expected a barrel mode (default, named or all) in",
    );

    await expect(runCommand(barrels, "tool")).rejects.toThrow(
      'cannot be exported as "kebab-case"',
    );
  });
});
