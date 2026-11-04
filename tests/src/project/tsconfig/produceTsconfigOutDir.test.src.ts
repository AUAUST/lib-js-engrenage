import { fileURLToPath } from "node:url";

import { describe, expect, test } from "vitest";

import { configSchema } from "#config/config/schemas/configSchema";
import { createResolvedConfig } from "#config/utils/createResolvedConfig";
import { validate } from "#options/utils/validate";
import { createTemporaryProject } from "#tests/helpers/createTemporaryProject";
import { withSourceRuntime } from "#tests/helpers/withSourceRuntime";
import { syncTsconfigFiles } from "#tsconfig/setup/syncTsconfigFiles";

const libraryPreset = fileURLToPath(
  new URL("../../../../data/tsconfig/library.json", import.meta.url),
);

function syncOutDir(build: unknown, files: Record<string, string> = {}) {
  const project = createTemporaryProject({
    "package.json": "{}",
    "src/index.ts": "",
    "tsconfig.json": JSON.stringify({ extends: libraryPreset }),
    ...files,
  });

  const config = createResolvedConfig({
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

  syncTsconfigFiles(config);
  config.filesystem.flush();

  return JSON.parse(project.read("tsconfig.src.json")).compilerOptions;
}

describe("produceTsconfigOutDir", () => {
  test("writes a build.outDir that differs from the inherited one", () => {
    expect(syncOutDir({ outDir: "build" }).outDir).toBe("./build");
  });

  test("writes nothing when build.outDir matches the inherited one", () => {
    expect(syncOutDir({ outDir: "dist" })).not.toHaveProperty("outDir");
  });

  test("leaves outDir untouched without build.outDir", () => {
    const tsconfig = JSON.stringify({
      compilerOptions: { outDir: "./out" },
    });

    expect(syncOutDir({}, { "tsconfig.src.json": tsconfig }).outDir).toBe(
      "./out",
    );
  });
});
