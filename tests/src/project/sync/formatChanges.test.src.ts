import { mkdirSync, symlinkSync } from "node:fs";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, test } from "vitest";

import { createProjectConfig } from "#project/config/index";
import { formatChanges } from "#project/sync/index";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";

const unformatted = '{\n  "list": [\n    "a"\n  ]\n}\n';

async function stage(format: Readonly<Record<string, unknown>> | undefined) {
  const project = createTemporaryProject({ "package.json": "{}" });

  const prettier = project.resolve("node_modules/prettier");

  mkdirSync(dirname(prettier), { recursive: true });

  symlinkSync(
    dirname(fileURLToPath(import.meta.resolve("prettier/package.json"))),
    prettier,
  );

  const config = createProjectConfig({
    root: project.root,
    raw: format === undefined ? {} : { format },
    configFile: undefined,
  });

  const { filesystem } = config.context;

  await filesystem.write("data.json", unformatted);

  await formatChanges(config);

  return filesystem.read("data.json");
}

describe("formatChanges", () => {
  test("formats staged content with the only active formatter", async () => {
    expect(await stage(undefined)).toBe('{\n  "list": ["a"]\n}\n');
  });

  test("stages content unformatted when format.formatter is false", async () => {
    expect(await stage({ formatter: false })).toBe(unformatted);
  });
});
