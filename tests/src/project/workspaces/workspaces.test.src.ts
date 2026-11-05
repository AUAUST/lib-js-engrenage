import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

import { build } from "vite";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { runSync, sync } from "#bin/engrenage/sync";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { mockCwd } from "#tests/utils/mockCwd";
import { runCommand } from "#tests/utils/runCommand";
import { resolveConventionConfig } from "#tools/eslint/operations/resolveConventionConfig";
import { resolveScope } from "#tools/eslint/operations/resolveScope";
import { loadConfig } from "#workflows/registry/operations/loadConfig";

const placeholder = "{dir}";

const config = `export default {
  src: { node: 24 },
  workspaces: {
    "extensions/action-*": { name: "@scope/app-${placeholder}" },
    "extensions/functions-*": {
      name: "@scope/fn-${placeholder}",
      tsconfig: { compilerOptions: { jsx: "preserve" } },
    },
  },
};
`;

const files = {
  "engrenage.config.ts": config,
  "package.json": JSON.stringify({
    name: "app",
    type: "module",
    version: "1.2.3",
    license: "MIT",
  }),
  "tsconfig.json": "{}",
  "src/index.ts": "",
  "extensions/action-a/src/index.tsx": "",
  "extensions/action-a/package.json": JSON.stringify({
    shopify: { handle: "a" },
    dependencies: { "@scope/app-action-b": "workspace:*" },
  }),
  "extensions/action-b/src/index.ts": "",
  "extensions/functions-c/src/index.ts": "",
};

function createProject() {
  const project = createTemporaryProject(files);

  mockCwd(project.root);

  return project;
}

beforeEach(() => {
  vi.spyOn(console, "info").mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("workspaces", () => {
  test("syncs the workspace files of two globs, and a check reports drift", async () => {
    const project = createProject();

    await runCommand(sync, "workspaces", "pnpm");

    expect(project.read("pnpm-workspace.yaml")).toContain(
      "packages:\n  - extensions/action-*\n  - extensions/functions-*\n",
    );

    expect(
      JSON.parse(project.read("extensions/action-a/package.json")),
    ).toEqual({
      name: "@scope/app-action-a",
      private: true,
      version: "1.2.3",
      license: "MIT",
      imports: {
        "#self/*": {
          types: ["./src/*.ts", "./src/*.tsx"],
          default: "./src/*",
        },
      },
      shopify: { handle: "a" },
      dependencies: { "@scope/app-action-b": "workspace:*" },
    });

    expect(
      JSON.parse(project.read("extensions/functions-c/package.json")).name,
    ).toBe("@scope/fn-functions-c");

    expect(
      JSON.parse(project.read("extensions/action-b/tsconfig.json")),
    ).toEqual({
      extends: "../../tsconfig.json",
      include: ["**/*.ts", "**/*.tsx"],
    });

    expect(
      JSON.parse(project.read("extensions/functions-c/tsconfig.json"))
        .compilerOptions,
    ).toEqual({ jsx: "preserve" });

    vi.mocked(console.info).mockClear();

    await runCommand(sync, "workspaces", "pnpm", "--check");

    expect(process.exitCode).toBeUndefined();
  });

  test("reports a workspace file that drifted from the declaration", async () => {
    createProject().write(
      "extensions/action-b/package.json",
      JSON.stringify({ name: "wrong", private: true }),
    );

    await runCommand(sync, "workspaces", "--check");

    expect(process.exitCode).toBe(1);

    expect(vi.mocked(console.info).mock.calls.flat()).toContain(
      "outdated: extensions/action-b/package.json",
    );

    process.exitCode = undefined;
  });

  test("derives the lint scope and the solution references from the declaration", async () => {
    const project = createProject();

    const resolved = await loadConfig(project.root);

    const conventions = await resolveConventionConfig(resolved);

    expect(resolveScope(conventions, ["files.workspaces"])).toEqual([
      "extensions/action-a/**/*.{ts,tsx}",
      "extensions/action-b/**/*.{ts,tsx}",
      "extensions/functions-c/**/*.{ts,tsx}",
    ]);

    expect(resolveScope(conventions, ["files.code"])).toEqual(
      expect.arrayContaining(resolveScope(conventions, ["files.workspaces"])),
    );

    await runSync(resolved, { names: ["tsconfig"] });

    expect(
      JSON.parse((await resolved.get("filesystem")).read("tsconfig.json") ?? "")
        .references,
    ).toEqual(
      expect.arrayContaining([
        { path: "./extensions/action-a/tsconfig.json" },
        { path: "./extensions/functions-c/tsconfig.json" },
      ]),
    );
  });

  test("resolves the import rules between workspaces from their dependencies", async () => {
    const project = createProject();

    const config = await loadConfig(project.root);
    const importRules = await config.get("importRules");

    function targets(source: string, effect: "allow" | "forbid") {
      return importRules
        .filter((rule) => {
          return (
            rule.source.kind === "element" &&
            rule.source.path === source &&
            rule.effect === effect
          );
        })
        .flatMap((rule) => rule.targets)
        .map((target) => {
          return target.kind === "element" ? target.path : "";
        });
    }

    expect(targets("extensions/action-a", "allow")).toEqual([
      "extensions/action-b",
    ]);

    expect(targets("extensions/action-a", "forbid")).toEqual([
      "extensions/functions-c",
    ]);

    expect(targets("extensions/action-b", "forbid")).toEqual([
      "extensions/action-a",
      "extensions/functions-c",
    ]);

    expect(
      importRules.find(({ reason }) => {
        return reason === "root src never imports a workspace";
      })?.targets,
    ).toEqual([
      { kind: "element", path: "extensions/action-a" },
      { kind: "element", path: "extensions/action-b" },
      { kind: "element", path: "extensions/functions-c" },
    ]);
  });
});

describe("workspace modules", () => {
  test("import their own #self modules and a src alias, type-check and build through Vite", async () => {
    const project = createTemporaryProject({
      "engrenage.config.ts": `export default {
        src: { node: 24, bundled: true, aliases: { define: { "$shared/*": "./shared/*.ts" } } },
        typescript: { tsconfig: { extends: false, compilerOptions: { module: "ESNext", moduleResolution: "Bundler", target: "ESNext", strict: true, noEmit: true, skipLibCheck: true, lib: ["ESNext"], types: [] } } },
        workspaces: { "extensions/action-*": { name: "@scope/app-${placeholder}" } },
      };\n`,
      "package.json": '{ "name": "app", "type": "module" }',
      "tsconfig.json": "{}",
      "src/index.ts": "",
      "shared/greeting.ts": 'export const greeting: string = "hello";\n',
      "extensions/action-a/src/helper.ts":
        "export const helper: string = 'helped';\n",
      "extensions/action-a/src/index.ts":
        "import { greeting } from '$shared/greeting';\nimport { helper } from '#self/helper';\n\nexport const message: string = `${greeting} ${helper}`;\n",
    });

    const resolved = await loadConfig(project.root);

    await runSync(resolved, { names: ["tsconfig", "aliases", "workspaces"] });
    (await resolved.get("filesystem")).flush();

    execFileSync(
      process.execPath,
      [
        fileURLToPath(import.meta.resolve("typescript/bin/tsc")),
        "-p",
        "extensions/action-a/tsconfig.json",
      ],
      { cwd: project.root, stdio: "pipe" },
    );

    const output = await build({
      root: project.root,
      configFile: false,
      logLevel: "silent",
      resolve: { tsconfigPaths: true },
      build: {
        write: false,
        lib: {
          entry: "extensions/action-a/src/index.ts",
          formats: ["es"],
        },
      },
    });

    const code = [output].flat().flatMap((result) => {
      return "output" in result
        ? result.output.map((chunk) => {
            return "code" in chunk ? chunk.code : "";
          })
        : [];
    });

    expect(code.join("\n")).toContain("hello");
    expect(code.join("\n")).toContain("helped");
  });
});
