import { mkdirSync, symlinkSync } from "node:fs";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, test } from "vitest";

import { configSchema } from "#config/config/schemas/configSchema";
import { createFilesystem } from "#config/utils/createFilesystem";
import { createResolvedConfig } from "#config/utils/createResolvedConfig";
import { createTemporaryProject } from "#tests/helpers/createTemporaryProject";
import { withSourceRuntime } from "#tests/helpers/withSourceRuntime";
import { syncTsconfigFiles } from "#typescript/setup/syncTsconfigFiles";
import { validate } from "#utils/validate";

function createProject(files: Record<string, string>) {
  const project = createTemporaryProject({
    "package.json": "{}",
    ...files,
  });

  const prettier = project.resolve("node_modules/prettier");

  mkdirSync(dirname(prettier), {
    recursive: true,
  });

  symlinkSync(
    dirname(fileURLToPath(import.meta.resolve("prettier/package.json"))),
    prettier,
  );

  return project;
}

describe("filesystem.format", () => {
  test("writes a synced tsconfig the way Prettier prints it", async () => {
    const project = createProject({
      "src/index.ts": "",
      "tsconfig.json": "{}",
    });

    const config = createResolvedConfig({
      root: project.root,
      raw: validate(configSchema, withSourceRuntime({}), "test config"),
      configFile: undefined,
    });

    syncTsconfigFiles(config);

    await config.filesystem.format();
    config.filesystem.flush();

    const content = project.read("tsconfig.src.json");

    expect(content).toContain('"include": ["src/**/*.ts"');

    expect(content).toBe(
      await (
        await import("prettier")
      ).format(content, {
        filepath: "tsconfig.src.json",
      }),
    );
  });

  test("reports no change for a formatted file whose value is up to date", async () => {
    const project = createProject({});

    const filesystem = createFilesystem(project.root);

    project.write("data.json", '{\n  "list": ["a"]\n}\n');

    filesystem.write("data.json", '{\n  "list": [\n    "a"\n  ]\n}\n');

    await filesystem.format();

    expect(filesystem.discard()).toEqual([]);
  });

  test("leaves files without Prettier untouched", async () => {
    const project = createTemporaryProject({});

    const filesystem = createFilesystem(project.root);

    filesystem.write("data.json", '{\n  "list": [\n    "a"\n  ]\n}\n');

    await filesystem.format();

    expect(filesystem.read("data.json")).toBe(
      '{\n  "list": [\n    "a"\n  ]\n}\n',
    );
  });
});
