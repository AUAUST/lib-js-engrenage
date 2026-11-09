import { mkdirSync, symlinkSync } from "node:fs";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, test } from "vitest";

import { loadConfig } from "@auaust/engrenage/config";
import { formatContent, formatFile } from "@auaust/engrenage/format";
import { formatWithPrettier } from "@auaust/engrenage/prettier";

import { createTemporaryProject } from "#tests/utils/createTemporaryProject";

function createProject() {
  const project = createTemporaryProject({
    "package.json": "{}",
    ".prettierrc.json": '{ "singleQuote": true }',
  });

  const prettier = project.resolve("node_modules/prettier");

  mkdirSync(dirname(prettier), { recursive: true });

  symlinkSync(
    dirname(fileURLToPath(import.meta.resolve("prettier/package.json"))),
    prettier,
  );

  return project;
}

describe("formatContent", () => {
  test("formats a TypeScript string with the project's Prettier options", async () => {
    const project = createProject();

    const formatted = await formatContent('export const a = "x"\n', {
      path: project.resolve("a.ts"),
      config: await loadConfig(project.root),
      formatter: formatWithPrettier,
    });

    expect(formatted).toBe("export const a = 'x';\n");
  });

  test("returns the content when the formatter does not handle the file", async () => {
    const project = createProject();

    const formatted = await formatContent("a  b", {
      path: project.resolve("a.unknown"),
      config: await loadConfig(project.root),
      formatter: formatWithPrettier,
    });

    expect(formatted).toBe("a  b");
  });
});

describe("formatFile", () => {
  test("rewrites a file in place", async () => {
    const project = createProject();

    project.write("a.ts", 'export const a = "x"\n');

    await formatFile("a.ts", {
      config: await loadConfig(project.root),
      formatter: formatWithPrettier,
    });

    expect(project.read("a.ts")).toBe("export const a = 'x';\n");
  });
});
