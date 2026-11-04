import { describe, expect, test } from "vitest";

import { resolvePathAliases } from "#project/tsconfig/operations/resolvePathAliases";
import { syncTsconfigFiles } from "#project/tsconfig/setup/syncTsconfigFiles";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { withSourceRuntime } from "#tests/utils/withSourceRuntime";
import { resolveSourceEntries } from "#tools/tsdown/operations/resolveSourceEntries";
import { createConfig } from "#workflows/registry/operations/createConfig";

const exports = { ".": "src/index.ts", "./*": "src/*/index.ts" };

function syncProject(input: Record<string, unknown>, baseTsconfig = "{}") {
  const project = createTemporaryProject({
    "package.json": JSON.stringify({ name: "@scope/package" }),
    "src/index.ts": "",
    "src/utils/index.ts": "",
    "tests/index.ts": "",
    "tsconfig.json": baseTsconfig,
  });

  const config = createConfig({
    root: project.root,
    raw: withSourceRuntime(input),
    configFile: undefined,
  });

  syncTsconfigFiles(config);
  config.filesystem.flush();

  return {
    config,
    root: project.root,
    read: (file: string) => JSON.parse(project.read(file)),
  };
}

describe("produceTsconfigPaths", () => {
  test("generates the package-name aliases from src.exports", () => {
    const { read } = syncProject({
      src: { exports },
    });

    expect(read("tsconfig.json").compilerOptions.paths).toEqual({
      "@scope/package": ["./src/index.ts"],
      "@scope/package/*": ["./src/*/index.ts"],
    });
  });

  test("keeps hand-written aliases and replaces stale package-name ones", () => {
    const { read } = syncProject(
      {
        src: { exports },
      },
      JSON.stringify({
        compilerOptions: {
          paths: {
            "#internal/*": ["./src/internal/*"],
            "@scope/package/old": ["./src/old.ts"],
          },
        },
      }),
    );

    expect(read("tsconfig.json").compilerOptions.paths).toEqual({
      "#internal/*": ["./src/internal/*"],
      "@scope/package": ["./src/index.ts"],
      "@scope/package/*": ["./src/*/index.ts"],
    });
  });

  test("leaves paths untouched without src.exports", () => {
    const paths = { "@scope/package": ["./src/index.ts"] };

    const { read } = syncProject(
      {},
      JSON.stringify({
        compilerOptions: { paths },
      }),
    );

    expect(read("tsconfig.json").compilerOptions.paths).toEqual(paths);
  });

  test("resolves the generated aliases like src.exports", () => {
    const { config, root, read } = syncProject({
      src: { exports },
    });

    expect(
      resolvePathAliases(
        "@scope/package",
        read("tsconfig.json").compilerOptions.paths,
        root,
      ),
    ).toEqual(resolveSourceEntries(config));
  });

  test("writes empty paths in the tests.dist tsconfig", () => {
    const { read } = syncProject({
      tests: {
        dist: {
          tsconfig: { path: "tsconfig.tests.dist.json" },
        },
      },
    });

    expect(read("tsconfig.tests.dist.json").compilerOptions.paths).toEqual({});
  });
});
