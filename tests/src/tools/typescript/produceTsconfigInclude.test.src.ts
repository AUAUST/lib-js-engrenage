import { describe, expect, test } from "vitest";

import { createProjectConfig } from "#project/config/operations/createProjectConfig";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { withSourceRuntime } from "#tests/utils/withSourceRuntime";
import { syncTsconfigFiles } from "#tools/typescript/setup/syncTsconfigFiles";

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
  test("includes the globs of the environment and the env file when it defines", async () => {
    const read = await syncProject({});

    expect(read("tsconfig.src.json").include).toEqual([
      "src/**/*.ts",
      "src/**/*.tsx",
      "env.d.ts",
    ]);

    expect(read("tsconfig.bin.json").include).toEqual([
      "bin/**/*.ts",
      "bin/**/*.tsx",
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

    const expected = ["spec/**/*.ts", "spec/**/*.tsx", "env.d.ts"];

    expect(read("tsconfig.tests.json").include).toEqual(expected);

    expect(read("tsconfig.tests.dist.json").include).toEqual([
      "spec/**/*.spec.ts",
      "spec/**/*.spec.tsx",
      "spec/**/*.test.ts",
      "spec/**/*.test.tsx",
      "spec/**/*.spec.dist.ts",
      "spec/**/*.spec.dist.tsx",
      "spec/**/*.test.dist.ts",
      "spec/**/*.test.dist.tsx",
      "env.d.ts",
    ]);
  });

  test("adds the globs of an inheriting environment", async () => {
    const read = await syncProject({
      scripts: {
        tsconfig: { inherits: "bin" },
      },
    });

    expect(read("tsconfig.bin.json").include).toEqual([
      "bin/**/*.ts",
      "bin/**/*.tsx",
      "scripts/**/*.ts",
      "scripts/**/*.tsx",
      "*.config.ts",
      ".*.ts",
      "tooling/**/*.ts",
      "tooling/**/*.tsx",
    ]);

    expect(() => read("tsconfig.scripts.json")).toThrow("ENOENT");
  });

  test("adds the env file to an environment that defines", async () => {
    const read = await syncProject({
      bin: { defines: true },
    });

    expect(read("tsconfig.bin.json").include).toEqual([
      "bin/**/*.ts",
      "bin/**/*.tsx",
      "env.d.ts",
    ]);
  });

  test("removes an excluded glob", async () => {
    const read = await syncProject({
      src: {
        tsconfig: {
          include: { exclude: ["env.d.ts"] },
        },
      },
    });

    expect(read("tsconfig.src.json").include).toEqual([
      "src/**/*.ts",
      "src/**/*.tsx",
    ]);
  });

  test("excludes fixtures from the tests tsconfig only", async () => {
    const read = await syncProject({});

    expect(read("tsconfig.tests.json").exclude).toEqual([
      "tests/**/fixtures/**",
    ]);

    expect(read("tsconfig.src.json").exclude).toBeUndefined();
  });

  test("expands nested braces that tsconfig globs do not support", async () => {
    const read = await syncProject({
      typescript: { files: ["**/*.{m,c,}{ts,js}", "{a}/*.ts"] },
    });

    expect(read("tsconfig.bin.json").include).toEqual([
      "bin/**/*.mts",
      "bin/**/*.mjs",
      "bin/**/*.cts",
      "bin/**/*.cjs",
      "bin/**/*.ts",
      "bin/**/*.js",
      "bin/{a}/*.ts",
    ]);
  });

  test("writes globs relative to a tsconfig in a subdirectory", async () => {
    const read = await syncProject({
      src: {
        tsconfig: { path: "config/tsconfig.src.json" },
      },
    });

    expect(read("config/tsconfig.src.json").include).toEqual([
      "../src/**/*.ts",
      "../src/**/*.tsx",
      "../env.d.ts",
    ]);
  });
});
