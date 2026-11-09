import { describe, expect, test } from "vitest";

import { createProjectConfig } from "#project/config/operations/createProjectConfig";
import { resolvePathAliases } from "#project/tsconfig/operations/resolvePathAliases";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { withSourceRuntime } from "#tests/utils/withSourceRuntime";
import { resolveSourceEntries } from "#tools/tsdown/operations/resolveSourceEntries";
import { syncTsconfigFiles } from "#tools/typescript/setup/syncTsconfigFiles";

const exports = { ".": "src/index.ts", "./*": "src/*/index.ts" };

async function syncProject(
  input: Record<string, unknown>,
  baseTsconfig = "{}",
) {
  const project = createTemporaryProject({
    "package.json": JSON.stringify({ name: "@scope/package" }),
    "src/index.ts": "",
    "src/utils/index.ts": "",
    "tests/index.ts": "",
    "tsconfig.json": baseTsconfig,
  });

  const config = createProjectConfig({
    root: project.root,
    raw: withSourceRuntime(input),
    configFile: undefined,
  });

  await syncTsconfigFiles(config);

  await config.context.filesystem.flush();

  return {
    config,
    root: project.root,
    read: (file: string) => JSON.parse(project.read(file)),
  };
}

describe("produceTsconfigPaths", () => {
  test("generates the package-name aliases from src.exports", async () => {
    const { read } = await syncProject({
      src: { exports },
    });

    expect(read("tsconfig.json").compilerOptions.paths).toEqual({
      "@scope/package": ["./src/index.ts"],
      "@scope/package/*": ["./src/*/index.ts"],
    });
  });

  test("keeps hand-written aliases and replaces stale package-name ones", async () => {
    const { read } = await syncProject(
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

  test("leaves paths untouched without src.exports", async () => {
    const paths = { "@scope/package": ["./src/index.ts"] };

    const { read } = await syncProject(
      {},
      JSON.stringify({
        compilerOptions: { paths },
      }),
    );

    expect(read("tsconfig.json").compilerOptions.paths).toEqual(paths);
  });

  test("resolves the generated aliases like src.exports", async () => {
    const { config, root, read } = await syncProject({
      src: { exports },
    });

    expect(
      await resolvePathAliases(
        "@scope/package",
        read("tsconfig.json").compilerOptions.paths,
        root,
      ),
    ).toEqual(
      await resolveSourceEntries({
        packageJson: await config.resolve("packageJson"),
        root: config.context.root,
        exposed: await config.resolve("src.exports"),
        tsconfig: await config.resolve("tsconfig"),
      }),
    );
  });

  test("writes empty paths in the tests.dist tsconfig", async () => {
    const { read } = await syncProject({
      tests: {
        dist: {
          tsconfig: { path: "tsconfig.tests.dist.json" },
        },
      },
    });

    expect(read("tsconfig.tests.dist.json").compilerOptions.paths).toEqual({});
  });
});
