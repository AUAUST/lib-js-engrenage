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

describe("produceTsconfigInclude", () => {
  test("includes the globs of the environment", async () => {
    const read = await syncProject({});

    expect(read("tsconfig.src.json").include).toEqual([
      "src/**/*.ts",
      "src/**/*.mts",
      "src/**/*.cts",
      "src/**/*.tsx",
    ]);

    expect(read("tsconfig.bin.json").include).toEqual([
      "bin/**/*.ts",
      "bin/**/*.mts",
      "bin/**/*.cts",
    ]);
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

    const expected = [
      "spec/**/*.ts",
      "spec/**/*.mts",
      "spec/**/*.cts",
      "spec/**/*.tsx",
    ];

    expect(read("tsconfig.tests.json").include).toEqual(expected);

    expect(read("tsconfig.tests.dist.json").include).toEqual([
      "spec/**/*.test.ts",
      "spec/**/*.test.tsx",
      "spec/**/*.test.dist.ts",
      "spec/**/*.test.dist.tsx",
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
      "tooling/**/*.mts",
      "tooling/**/*.cts",
    ]);

    expect(read("tsconfig.scripts.json").include).toEqual([
      "scripts/**/*.ts",
      "scripts/**/*.mts",
      "scripts/**/*.cts",
    ]);
  });

  test("includes the declarations of src in the tests and consumers, never in tests.dist", async () => {
    const read = await syncProject(
      {
        bin: {
          tsconfig: { path: "config/tsconfig.bin.json" },
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
      "tests/**/*.mts",
      "tests/**/*.cts",
      "tests/**/*.tsx",
      "src/env.d.ts",
    ]);

    expect(read("config/tsconfig.bin.json").include).toEqual([
      "../bin/**/*.ts",
      "../bin/**/*.mts",
      "../bin/**/*.cts",
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

    expect(read("tsconfig.tests.json").include).toEqual([
      "tests/**/*.ts",
      "tests/**/*.mts",
      "tests/**/*.cts",
      "tests/**/*.tsx",
    ]);

    expect(read("tsconfig.bin.json").include).toEqual([
      "bin/**/*.ts",
      "bin/**/*.mts",
      "bin/**/*.cts",
    ]);

    expect(read("tsconfig.tests.dist.json").include).toEqual([
      "tests/**/*.test.ts",
      "tests/**/*.test.tsx",
      "tests/**/*.test.dist.ts",
      "tests/**/*.test.dist.tsx",
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

  test("removes an excluded glob", async () => {
    const read = await syncProject({
      src: {
        tsconfig: {
          include: { exclude: ["src/**/*.tsx"] },
        },
      },
    });

    expect(read("tsconfig.src.json").include).toEqual([
      "src/**/*.ts",
      "src/**/*.mts",
      "src/**/*.cts",
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

  test("writes globs relative to a tsconfig in a subdirectory", async () => {
    const read = await syncProject({
      src: {
        tsconfig: { path: "config/tsconfig.src.json" },
      },
    });

    expect(read("config/tsconfig.src.json").include).toEqual([
      "../src/**/*.ts",
      "../src/**/*.mts",
      "../src/**/*.cts",
      "../src/**/*.tsx",
    ]);
  });
});
