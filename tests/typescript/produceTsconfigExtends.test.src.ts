import { describe, expect, test } from "vitest";

import { configSchema } from "#config/config/schemas/configSchema";
import { createResolvedConfig } from "#config/utils/createResolvedConfig";
import { validate } from "#foundation/options/utils/validate";
import { createTemporaryProject } from "#tests/helpers/createTemporaryProject";
import { withSourceRuntime } from "#tests/helpers/withSourceRuntime";
import { syncTsconfigFiles } from "#typescript/setup/syncTsconfigFiles";

function syncProject(input: unknown, files: Record<string, string> = {}) {
  const project = createTemporaryProject({
    "package.json": "{}",
    "src/index.ts": "",
    "tsconfig.json": "{}",
    ...files,
  });

  const config = createResolvedConfig({
    root: project.root,
    raw: validate(configSchema, withSourceRuntime(input), "test config"),
    configFile: undefined,
  });

  syncTsconfigFiles(config);
  config.filesystem.flush();

  return (file: string) => JSON.parse(project.read(file)).extends;
}

describe("produceTsconfigExtends", () => {
  test("extends the library tsconfig of the library preset", () => {
    const read = syncProject({ presets: ["library"] });

    expect(read("tsconfig.json")).toBe(
      "@auaust/engrenage/tsconfig/library.json",
    );

    expect(read("tsconfig.src.json")).toBe("./tsconfig.json");
  });

  test("extends the base tsconfig without preset", () => {
    const read = syncProject({});

    expect(read("tsconfig.json")).toBe("@auaust/engrenage/tsconfig/base.json");
  });

  test("extends the base from an environment tsconfig in a subdirectory", () => {
    const read = syncProject({
      src: {
        tsconfig: { path: "config/tsconfig.src.json" },
      },
    });

    expect(read("config/tsconfig.src.json")).toBe("../tsconfig.json");
  });

  test("appends a base as an array", () => {
    const read = syncProject({
      src: {
        tsconfig: {
          extends: { append: ["./custom.json"] },
        },
      },
    });

    expect(read("tsconfig.src.json")).toEqual([
      "./tsconfig.json",
      "./custom.json",
    ]);
  });

  test("extends the tests tsconfig from the dist variant", () => {
    const read = syncProject(
      {
        tests: {
          dist: {
            tsconfig: { path: "tsconfig.tests.dist.json" },
          },
        },
      },
      {
        "tests/index.ts": "",
      },
    );

    expect(read("tsconfig.tests.dist.json")).toBe("./tsconfig.tests.json");
  });
});
