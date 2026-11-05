import { describe, expect, test } from "vitest";

import { syncTsconfigFiles } from "#project/tsconfig/setup/syncTsconfigFiles";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { withSourceRuntime } from "#tests/utils/withSourceRuntime";
import { createConfig } from "#workflows/registry/operations/createConfig";

async function syncProject(
  input: Record<string, unknown>,
  files: Record<string, string> = {},
) {
  const project = createTemporaryProject({
    "package.json": "{}",
    "src/index.ts": "",
    "tsconfig.json": "{}",
    ...files,
  });

  const config = createConfig({
    root: project.root,
    raw: withSourceRuntime(input),
    configFile: undefined,
  });

  await syncTsconfigFiles(config);
  (await config.get("filesystem")).flush();

  return (file: string) => JSON.parse(project.read(file)).extends;
}

describe("produceTsconfigExtends", () => {
  test("extends the library tsconfig of the library preset", async () => {
    const read = await syncProject({ preset: "library" });

    expect(read("tsconfig.json")).toBe(
      "@auaust/engrenage/tsconfig/library.json",
    );

    expect(read("tsconfig.src.json")).toBe("./tsconfig.json");
  });

  test("extends the base tsconfig without preset", async () => {
    const read = await syncProject({});

    expect(read("tsconfig.json")).toBe("@auaust/engrenage/tsconfig/base.json");
  });

  test("extends the base from an environment tsconfig in a subdirectory", async () => {
    const read = await syncProject({
      src: {
        tsconfig: { path: "config/tsconfig.src.json" },
      },
    });

    expect(read("config/tsconfig.src.json")).toBe("../tsconfig.json");
  });

  test("appends a base as an array", async () => {
    const read = await syncProject({
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

  test("extends the tests tsconfig from the dist variant", async () => {
    const read = await syncProject(
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
