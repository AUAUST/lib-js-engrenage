import { fileURLToPath } from "node:url";

import { describe, expect, test } from "vitest";

import { validate } from "#foundation/options/utils/validate";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { withSourceRuntime } from "#tests/utils/withSourceRuntime";
import { syncTsconfigFiles } from "#tools/typescript/setup/syncTsconfigFiles";
import { configSchema } from "#workflows/registry/config/schemas/configSchema";
import { createConfig } from "#workflows/registry/operations/createConfig";

const libraryPreset = fileURLToPath(
  new URL("../../../../data/tsconfig/library.json", import.meta.url),
);

async function syncOutDir(build: unknown, files: Record<string, string> = {}) {
  const project = createTemporaryProject({
    "package.json": "{}",
    "src/index.ts": "",
    "tsconfig.json": JSON.stringify({ extends: libraryPreset }),
    ...files,
  });

  const config = createConfig({
    root: project.root,
    raw: validate(
      configSchema,
      withSourceRuntime({
        build,
        typescript: {
          tsconfig: { extends: false },
        },
      }),
      "test config",
    ),
    configFile: undefined,
  });

  await syncTsconfigFiles(config);
  await config.context.filesystem.flush();

  return JSON.parse(project.read("tsconfig.src.json")).compilerOptions;
}

describe("produceTsconfigOutDir", () => {
  test("writes a build.outDir that differs from the inherited one", async () => {
    expect((await syncOutDir({ outDir: "build" })).outDir).toBe("./build");
  });

  test("writes nothing when build.outDir matches the inherited one", async () => {
    expect(await syncOutDir({ outDir: "dist" })).not.toHaveProperty("outDir");
  });

  test("leaves outDir untouched without build.outDir", async () => {
    const tsconfig = JSON.stringify({
      compilerOptions: { outDir: "./out" },
    });

    expect(
      (await syncOutDir({}, { "tsconfig.src.json": tsconfig })).outDir,
    ).toBe("./out");
  });
});
