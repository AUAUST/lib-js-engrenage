import { describe, expect, test } from "vitest";

import { configSchema } from "#config/config/schemas/configSchema";
import { createResolvedConfig } from "#config/utils/createResolvedConfig";
import { createTemporaryProject } from "#tests/helpers/createTemporaryProject";
import { syncTsconfigFiles } from "#typescript/setup/syncTsconfigFiles";
import { validate } from "#utils/validate";

function syncProject(input: unknown, files: Record<string, string> = {}) {
  const project = createTemporaryProject({
    "package.json": "{}",
    "src/index.ts": "",
    "tests/index.ts": "",
    "bin/index.ts": "",
    "scripts/index.ts": "",
    "tsconfig.json": "{}",
    ...files,
  });

  const config = createResolvedConfig({
    root: project.root,
    raw: validate(configSchema, input, "test config"),
    configFile: undefined,
  });

  syncTsconfigFiles(config);
  config.filesystem.flush();

  return (file: string) => JSON.parse(project.read(file));
}

describe("produceTsconfigInclude", () => {
  test("includes the globs of the environment and the env file when it defines", () => {
    const read = syncProject({});

    expect(read("tsconfig.src.json").include).toEqual([
      "src/**/*.{ts,tsx}",
      "env.d.ts",
    ]);

    expect(read("tsconfig.bin.json").include).toEqual(["bin/**/*.{ts,tsx}"]);
  });

  test("follows a custom tests.dirs in the tests and dist includes", () => {
    const read = syncProject(
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

    const expected = ["spec/**/*.{ts,tsx}", "env.d.ts"];

    expect(read("tsconfig.tests.json").include).toEqual(expected);
    expect(read("tsconfig.tests.dist.json").include).toEqual(expected);
  });

  test("adds the globs of an inheriting environment", () => {
    const read = syncProject({
      scripts: {
        tsconfig: { inherits: "bin" },
      },
    });

    expect(read("tsconfig.bin.json").include).toEqual([
      "bin/**/*.{ts,tsx}",
      "scripts/**/*.{ts,tsx}",
      "*.config.ts",
      ".*.ts",
    ]);

    expect(() => read("tsconfig.scripts.json")).toThrow("ENOENT");
  });

  test("adds the env file to an environment that defines", () => {
    const read = syncProject({
      bin: { defines: true },
    });

    expect(read("tsconfig.bin.json").include).toEqual([
      "bin/**/*.{ts,tsx}",
      "env.d.ts",
    ]);
  });

  test("removes an excluded glob", () => {
    const read = syncProject({
      src: {
        tsconfig: {
          include: { exclude: ["env.d.ts"] },
        },
      },
    });

    expect(read("tsconfig.src.json").include).toEqual(["src/**/*.{ts,tsx}"]);
  });

  test("excludes fixtures from the tests tsconfig only", () => {
    const read = syncProject({});

    expect(read("tsconfig.tests.json").exclude).toEqual([
      "tests/**/fixtures/**",
    ]);

    expect(read("tsconfig.src.json").exclude).toBeUndefined();
  });

  test("writes globs relative to a tsconfig in a subdirectory", () => {
    const read = syncProject({
      src: {
        tsconfig: { path: "config/tsconfig.src.json" },
      },
    });

    expect(read("config/tsconfig.src.json").include).toEqual([
      "../src/**/*.{ts,tsx}",
      "../env.d.ts",
    ]);
  });
});
