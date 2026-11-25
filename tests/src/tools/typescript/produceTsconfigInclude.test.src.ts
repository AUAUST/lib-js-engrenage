import { join } from "node:path";

import {
  flattenDiagnosticMessageText,
  getParsedCommandLineOfConfigFile,
  sys,
} from "typescript";
import { describe, expect, test } from "vitest";

import { createProjectConfig } from "#project/config/operations/createProjectConfig";
import { validateConfig } from "#project/config/operations/validateConfig";
import { syncDirectiveBlocks } from "#project/sync/setup/syncDirectiveBlocks";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { withSourceRuntime } from "#tests/utils/withSourceRuntime";
import { syncEnvFile } from "#tools/typescript/setup/syncEnvFile";
import { syncTsconfigFiles } from "#tools/typescript/setup/syncTsconfigFiles";
import { define } from "#workflows/config/index";

// @debt syncProject duplicates the one of produceTsconfigExtends.test.src.ts; one tests/utils helper returning the parsed tsconfig would serve both
async function syncProject(
  input: Record<string, unknown>,
  files: Record<string, string> = {},
) {
  const project = createTemporaryProject({
    "package.json": "{}",
    "src/index.ts": "",
    "tests/index.ts": "",
    "bin/index.ts": "",
    "scripts/index.ts": "",
    "tsconfig.json": "{}",
    ...files,
  });

  const config = createProjectConfig({
    root: project.root,
    raw: withSourceRuntime(input),
    configFile: undefined,
  });

  await syncTsconfigFiles(config);

  await config.context.filesystem.flush();

  return (file: string) => JSON.parse(project.read(file));
}

async function syncPlacedProject(
  environments: Record<string, unknown>,
  files: Record<string, string>,
) {
  const project = createTemporaryProject({
    "package.json": "{}",
    "tsconfig.json": "{}",
    "src/index.ts": "",
    "src/web/app.ts": "",
    "src/web/pages/home.ts": "",
    ...files,
  });

  const config = createProjectConfig({
    root: project.root,
    raw: withSourceRuntime({
      environments: {
        web: {
          preset: "src",
          dirs: ["src/web"],
          execution: { syntax: "2026-10" },
        },
        ...environments,
      },
    }),
    configFile: undefined,
  });

  await syncTsconfigFiles(config);

  await config.context.filesystem.flush();

  return (tsconfig: string) => {
    const parsed = getParsedCommandLineOfConfigFile(
      join(project.root, tsconfig),
      undefined,
      {
        ...sys,
        onUnRecoverableConfigFileDiagnostic({ messageText }) {
          throw new Error(flattenDiagnosticMessageText(messageText, "\n"));
        },
      },
    );

    return parsed?.fileNames
      .map((file) => file.slice(project.root.length + 1))
      .toSorted();
  };
}

describe("produceTsconfigInclude", () => {
  test("includes the globs of the environment", async () => {
    const read = await syncProject({});

    expect(read("tsconfig.src.json").include).toEqual(["src/**/*.ts"]);

    expect(read("tsconfig.bin.json").include).toEqual(["bin/**/*.ts"]);
  });

  test("follows a custom tests.dirs in the tests and dist includes", async () => {
    const read = await syncProject(
      {
        tests: {
          dirs: ["spec"],
          dist: {
            tsconfig: { path: "tsconfig.tests.dist.json" },
          },
        },
      },
      {
        "spec/index.ts": "",
      },
    );

    const expected = ["spec/**/*.ts"];

    expect(read("tsconfig.tests.json").include).toEqual(expected);

    expect(read("tsconfig.tests.dist.json").include).toEqual([
      "spec/**/*.test.ts",
      "spec/**/*.test.dist.ts",
      "spec/setup.ts",
      "spec/**/*.d.ts",
    ]);
  });

  test("gives the tooling files their own tsconfig, apart from scripts", async () => {
    const read = await syncProject(
      {},
      {
        "vite.config.ts": "",
        "scripts/a.ts": "",
        "tooling/b.ts": "",
      },
    );

    expect(read("tsconfig.tooling.json").include).toEqual([
      "*.config.ts",
      ".*.ts",
      "tooling/**/*.ts",
    ]);

    expect(read("tsconfig.scripts.json").include).toEqual(["scripts/**/*.ts"]);
  });

  test("includes the declarations of src in the tests and consumers, never in tests.dist", async () => {
    const read = await syncProject(
      {
        environments: {
          bin: {
            tsconfig: { path: "config/tsconfig.bin.json" },
          },
        },
        tests: {
          dist: {
            tsconfig: { path: "tsconfig.tests.dist.json" },
          },
        },
      },
      {
        "src/env.d.ts": "",
        "src/a/types.d.ts": "",
      },
    );

    expect(read("tsconfig.tests.json").include).toEqual([
      "tests/**/*.ts",
      "src/env.d.ts",
    ]);

    expect(read("config/tsconfig.bin.json").include).toEqual([
      "../bin/**/*.ts",
      "../src/env.d.ts",
    ]);

    const dist: readonly string[] = read("tsconfig.tests.dist.json").include;

    expect(dist.filter((glob) => glob.startsWith("src/"))).toEqual([]);
  });

  test("adds no entry while src has no declarations file", async () => {
    const read = await syncProject({
      tests: {
        dist: {
          tsconfig: { path: "tsconfig.tests.dist.json" },
        },
      },
    });

    expect(read("tsconfig.tests.json").include).toEqual(["tests/**/*.ts"]);

    expect(read("tsconfig.bin.json").include).toEqual(["bin/**/*.ts"]);

    expect(read("tsconfig.tests.dist.json").include).toEqual([
      "tests/**/*.test.ts",
      "tests/**/*.test.dist.ts",
      "tests/setup.ts",
      "tests/**/*.d.ts",
    ]);
  });

  test("includes declarations nested in the tests directories in tests.dist", async () => {
    const read = await syncProject(
      {
        tests: {
          dist: {
            tsconfig: { path: "tsconfig.tests.dist.json" },
          },
        },
      },
      {
        "src/env.d.ts": "",
        "tests/nested/ambient.d.ts": "",
      },
    );

    const include: readonly string[] = read("tsconfig.tests.dist.json").include;

    expect(include).toContain("tests/**/*.d.ts");

    expect(include.filter((glob) => glob.endsWith("env.d.ts"))).toEqual([]);
  });

  test("writes the define block into the declarations file of src only", async () => {
    const project = createTemporaryProject({
      "package.json": "{}",
      "src/index.ts": "",
      "tests/index.ts": "",
    });

    const config = createProjectConfig({
      root: project.root,
      raw: withSourceRuntime({
        define: {
          types: true,
          values: { __DEV__: define(true) },
        },
      }),
      configFile: undefined,
    });

    await syncEnvFile(config);

    await syncDirectiveBlocks(config);

    await config.context.filesystem.flush();

    expect(project.read("src/env.d.ts")).toContain(
      "// @define\ndeclare const __DEV__: boolean;\n// @end",
    );

    expect(() => project.read("env.d.ts")).toThrow("ENOENT");

    expect(() => project.read("tests/env.d.ts")).toThrow("ENOENT");
  });

  test.each([
    [
      "typescript.envFile",
      {
        typescript: { envFile: "env.d.ts" },
      },
    ],
    [
      "the defines of an environment",
      {
        bin: { defines: true },
      },
    ],
  ])("rejects %s", async (_name, input) => {
    const project = createTemporaryProject({ "package.json": "{}" });

    const config = createProjectConfig({
      root: project.root,
      raw: withSourceRuntime(input),
      configFile: undefined,
    });

    await expect(validateConfig(config)).rejects.toThrow('Unknown key "');
  });

  test("includes a root global declarations file in every tsconfig once it exists", async () => {
    const input = {
      tests: {
        dist: {
          tsconfig: { path: "tsconfig.tests.dist.json" },
        },
      },
    };

    const read = await syncProject(input, { "global.d.ts": "" });

    expect(read("tsconfig.src.json").include).toContain("global.d.ts");

    expect(read("tsconfig.tests.json").include).toContain("global.d.ts");

    expect(read("tsconfig.tests.dist.json").include).toContain("global.d.ts");

    const without = await syncProject(input);

    for (const file of [
      "tsconfig.src.json",
      "tsconfig.tests.json",
      "tsconfig.tests.dist.json",
    ]) {
      expect(without(file).include).not.toContain("global.d.ts");
    }
  });

  test("leaves out a .tsx file of an environment selecting TypeScript without a JSX flavour", async () => {
    const listProgramFiles = await syncPlacedProject(
      {},
      { "src/web/a.tsx": "" },
    );

    expect(listProgramFiles("tsconfig.web.json")).toEqual([
      "src/web/app.ts",
      "src/web/pages/home.ts",
    ]);
  });

  test("includes the .tsx files of a JSX flavour and sets its JSX keys", async () => {
    const read = await syncProject(
      {
        environments: {
          src: {
            languages: [
              {
                name: "typescript",
                options: { tsx: "solid" },
              },
            ],
          },
        },
      },
      {
        "src/a.tsx": "",
      },
    );

    const tsconfig = read("tsconfig.src.json");

    expect(tsconfig.include).toContain("src/**/*.tsx");

    expect(tsconfig.compilerOptions).toMatchObject({
      jsx: "preserve",
      jsxImportSource: "solid-js",
    });

    expect(read("tsconfig.tests.json").compilerOptions.jsx).toBeUndefined();
  });

  test("removes the JSX keys of a dropped flavour", async () => {
    const read = await syncProject(
      {},
      {
        "tsconfig.src.json": '{ "compilerOptions": { "jsx": "preserve", "jsxImportSource": "solid-js" } }',
      },
    );

    expect(read("tsconfig.src.json").compilerOptions).not.toHaveProperty("jsx");

    expect(read("tsconfig.src.json").compilerOptions).not.toHaveProperty(
      "jsxImportSource",
    );
  });

  test("fails on a TSX option naming no JSX flavour", async () => {
    await expect(
      syncProject({
        environments: {
          src: {
            languages: [
              {
                name: "typescript",
                options: { tsx: true },
              },
            ],
          },
        },
      }),
    ).rejects.toThrow(/"solid" \| "preact"/);
  });

  test("removes an excluded glob", async () => {
    const read = await syncProject({
      environments: {
        src: {
          languages: [
            {
              name: "typescript",
              options: { moduleExtensions: [".mts", ".cts"] },
            },
          ],
          tsconfig: {
            include: { exclude: ["src/**/*.cts"] },
          },
        },
      },
    });

    expect(read("tsconfig.src.json").include).toEqual([
      "src/**/*.ts",
      "src/**/*.mts",
    ]);
  });

  test("excludes fixtures from the tests tsconfig only", async () => {
    const read = await syncProject({});

    expect(read("tsconfig.tests.json").exclude).toEqual([
      "tests/**/fixtures/**",
    ]);

    expect(read("tsconfig.src.json").exclude).toBeUndefined();
  });

  test("excludes another environment's placement nested in the environment's directories", async () => {
    const read = await syncProject(
      {
        environments: {
          server: { preset: "bin", dirs: ["src/server"] },
        },
      },
      {
        "src/server/index.ts": "",
      },
    );

    expect(read("tsconfig.src.json").exclude).toEqual(["src/server/**"]);
  });

  test("keeps the environment's directory placements nested in another environment's placement", async () => {
    const listProgramFiles = await syncPlacedProject(
      {
        src: { dirs: ["src", "src/web/legacy"] },
      },
      {
        "src/web/legacy/old.ts": "",
        "src/web/legacy/deep/older.ts": "",
      },
    );

    expect(listProgramFiles("tsconfig.src.json")).toEqual([
      "src/index.ts",
      "src/web/legacy/deep/older.ts",
      "src/web/legacy/old.ts",
    ]);

    expect(listProgramFiles("tsconfig.web.json")).toEqual([
      "src/web/app.ts",
      "src/web/pages/home.ts",
    ]);
  });

  test("moves a directory an environment metafile places from the enclosing environment's tsconfig to its own", async () => {
    const listProgramFiles = await syncPlacedProject(
      {
        node: { preset: "bin" },
      },
      {
        "src/web/legacy/.environment.json": '{ "environment": "node" }',
        "src/web/legacy/old.ts": "",
      },
    );

    expect(listProgramFiles("tsconfig.web.json")).toEqual([
      "src/web/app.ts",
      "src/web/pages/home.ts",
    ]);

    expect(listProgramFiles("tsconfig.node.json")).toEqual([
      "src/web/legacy/old.ts",
    ]);
  });

  test("keeps the environment's file placements nested in another environment's placement", async () => {
    const listProgramFiles = await syncPlacedProject(
      {
        src: { dirs: ["src"], files: ["src/web/pages/kept.ts"] },
      },
      {
        "src/web/pages/kept.ts": "",
      },
    );

    expect(listProgramFiles("tsconfig.src.json")).toEqual([
      "src/index.ts",
      "src/web/pages/kept.ts",
    ]);
  });

  test("writes globs relative to a tsconfig in a subdirectory", async () => {
    const read = await syncProject({
      environments: {
        src: {
          tsconfig: { path: "config/tsconfig.src.json" },
        },
      },
    });

    expect(read("config/tsconfig.src.json").include).toEqual([
      "../src/**/*.ts",
    ]);
  });
});
