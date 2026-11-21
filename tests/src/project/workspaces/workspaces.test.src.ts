import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

import { afterEach, describe, expect, test, vi } from "vitest";

import { checkWorkspaces } from "#batiment/structure/index";
import { loadConfig } from "#project/config/operations/loadConfig";
import { runSync } from "#project/sync/index";
import { buildLibraryCode } from "#tests/utils/buildLibraryCode";
import { createProjectLinter } from "#tests/utils/createProjectLinter";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { mockCwd } from "#tests/utils/mockCwd";
import { runCommand } from "#tests/utils/runCommand";
import { resolveScope } from "#tools/eslint/operations/resolveScope";
import { resolveScopeSources } from "#tools/eslint/operations/resolveScopeSources";

import sync from "#bin/engrenage/sync";

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
  "extensions/action-a/.workspace.json": "{}",
  "extensions/action-a/src/index.tsx": "",
  "extensions/action-a/package.json": JSON.stringify({
    shopify: { handle: "a" },
    dependencies: { "@scope/app-action-b": "workspace:*" },
  }),
  "extensions/action-b/.workspace.json": "{}",
  "extensions/action-b/src/index.ts": "",
  "extensions/functions-c/.workspace.json": "{}",
  "extensions/functions-c/src/index.ts": "",
};

function createProject() {
  const project = createTemporaryProject(files);

  mockCwd(project.root);

  return project;
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("workspaces", () => {
  test("syncs the workspace files of two globs, and a check reports drift", async () => {
    const project = createProject();

    await runCommand("sync", sync, "workspaces", "pnpm");

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
          types: ["./src/*.ts", "./src/*.tsx", "./src/*.mts", "./src/*.cts"],
          default: "./src/*",
        },
      },
      shopify: {
        handle: "a",
      },
      dependencies: {
        "@scope/app-action-b": "workspace:*",
      },
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

    await runCommand("sync", sync, "workspaces", "pnpm", "--check");

    expect(process.exitCode).toBeUndefined();
  });

  test("writes the access of a private library to each workspace", async () => {
    const project = createProject();

    project.write(
      "engrenage.config.ts",
      config.replace(
        "{\n",
        '{\n  preset: "library",\n  visibility: "private",\n',
      ),
    );

    await runCommand("sync", sync, "workspaces");

    expect(
      JSON.parse(project.read("extensions/action-a/package.json"))
        .publishConfig,
    ).toEqual({ access: "restricted" });
  });

  test("reports a workspace file that drifted from the declaration", async () => {
    createProject().write(
      "extensions/action-b/package.json",
      JSON.stringify({ name: "wrong", private: true }),
    );

    const {
      messages,
    } = await runCommand("sync", sync, "workspaces", "--check");

    expect(process.exitCode).toBe(1);

    expect(messages.map(({ text }) => text)).toContain(
      "outdated: extensions/action-b/package.json",
    );

    process.exitCode = undefined;
  });

  test("detects the entry of a workspace holding only JavaScript", async () => {
    const project = createTemporaryProject({
      ...files,
      "extensions/action-d/.workspace.json": "{}",
      "extensions/action-d/src/index.js": "",
    });

    const groups = await (await loadConfig(project.root)).resolve("workspaces");

    expect(
      groups
        .flatMap(({ workspaces }) => workspaces)
        .find(({ dir }) => dir === "extensions/action-d")?.entry,
    ).toBe("extensions/action-d/src/index.js");
  });

  test("accepts a literal name for a glob without wildcard", async () => {
    const project = createTemporaryProject({
      ...files,
      "engrenage.config.ts": `export default { src: { node: 24 }, workspaces: { "theme": { name: "@scope/theme" } } };\n`,
      "theme/.workspace.json": "{}",
      "theme/src/index.ts": "",
    });

    const groups = await (await loadConfig(project.root)).resolve("workspaces");

    expect(
      groups
        .flatMap(({ workspaces }) => {
          return workspaces;
        })
        .map(({ name }) => {
          return name;
        }),
    ).toEqual(["@scope/theme"]);
  });

  test("rejects a literal name for a wildcard glob", async () => {
    const project = createTemporaryProject({
      ...files,
      "engrenage.config.ts": `export default { src: { node: 24 }, workspaces: { "extensions/action-*": { name: "@scope/app" } } };\n`,
    });

    await expect(
      (await loadConfig(project.root)).resolve("workspaces"),
    ).rejects.toThrow(
      `workspaces.extensions/action-*.name must contain ${placeholder}`,
    );
  });

  test("derives the lint scope and the solution references from the declaration", async () => {
    const project = createProject();

    const resolved = await loadConfig(project.root);

    const scopes = await resolveScopeSources(resolved);

    expect(resolveScope(scopes, ["files.workspaces"])).toEqual([
      "extensions/action-a/**/*.{ts,tsx}",
      "extensions/action-b/**/*.{ts,tsx}",
      "extensions/functions-c/**/*.{ts,tsx}",
    ]);

    expect(resolveScope(scopes, ["files.code"])).toEqual(
      expect.arrayContaining(resolveScope(scopes, ["files.workspaces"])),
    );

    await runSync(resolved, { names: ["tsconfig"] });

    const filesystem = resolved.context.filesystem;

    expect(
      JSON.parse((await filesystem.read("tsconfig.json")) ?? "").references,
    ).toEqual(
      expect.arrayContaining([
        { path: "./extensions/action-a/tsconfig.json" },
        { path: "./extensions/functions-c/tsconfig.json" },
      ]),
    );
  });

  test("checks workspace imports against declared dependencies", async () => {
    const project = createProject();

    const config = await loadConfig(project.root);

    const grants = await config.resolve("importGrants");

    const entities = await config.resolve("entities");

    function check(file: string, targetFile: string) {
      const importer = entities.entityOf(project.resolve(file));
      const target = entities.entityOf(project.resolve(targetFile));

      expect(importer).toBeDefined();
      expect(target).toBeDefined();

      return checkWorkspaces(
        {
          file,
          importer,
          specifier: targetFile,
          resolved: undefined,
          targetFile,
          target,
          kind: "runtime",
        },
        grants,
      );
    }

    const actionA = "extensions/action-a/src/index.tsx";
    const actionB = "extensions/action-b/src/index.ts";
    const functionsC = "extensions/functions-c/src/index.ts";

    expect(entities.entityOf(project.resolve(actionA))).toMatchObject({
      scope: "extensions/action-a",
      environment: undefined,
    });

    expect(check(actionA, actionB)).toBeUndefined();
    expect(check(actionA, actionA)).toBeUndefined();

    for (const [file, target] of [
      [actionA, functionsC],
      [actionB, actionA],
      [actionB, functionsC],
      ["src/index.ts", actionA],
      ["src/index.ts", actionB],
      ["src/index.ts", functionsC],
    ] as const) {
      expect(check(file, target)?.cause).toBe("scope");
    }
  });

  test("refuses with the scope message an import of a workspace from the root src", async () => {
    const { lint } = await createProjectLinter(config, {
      ...files,
      "src/index.ts": 'import "../extensions/action-a/src/index.tsx";\n',
    });

    const messages = await lint("src/index.ts", "auaust/import-workspaces");

    expect(messages.map(({ message }) => message)).toEqual([
      "`.` imports `extensions/action-a`, not a declared dependency of `.`.",
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
      "extensions/action-a/.workspace.json": "{}",
      "extensions/action-a/src/helper.ts": "export const helper: string = 'helped';\n",
      "extensions/action-a/src/index.ts": "import { greeting } from '$shared/greeting';\nimport { helper } from '#self/helper';\n\nexport const message: string = `${greeting} ${helper}`;\n",
    });

    const resolved = await loadConfig(project.root);

    await runSync(resolved, {
      names: ["tsconfig", "aliases", "workspaces"],
    });

    await resolved.context.filesystem.flush();

    execFileSync(
      process.execPath,
      [
        fileURLToPath(import.meta.resolve("typescript/bin/tsc")),
        "-p",
        "extensions/action-a/tsconfig.json",
      ],
      { cwd: project.root, stdio: "pipe" },
    );

    const code = await buildLibraryCode(
      project.root,
      "extensions/action-a/src/index.ts",
    );

    expect(code).toContain("hello");
    expect(code).toContain("helped");
  });
});
