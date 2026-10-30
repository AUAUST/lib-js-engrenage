import { symlinkSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { afterEach, describe, expect, test, vi } from "vitest";

import { createTemporaryProject } from "#tests/helpers/createTemporaryProject";
import { mockCwd } from "#tests/helpers/mockCwd";
import { runCommand } from "#tests/helpers/runCommand";

import tsc from "#bin/engrenage/tsc";

const repositoryModules = fileURLToPath(
  new URL("../../../node_modules", import.meta.url),
);

function createSolution(testSource: string) {
  const project = createTemporaryProject({
    "package.json": '{"name":"project","type":"module"}',
    "tsconfig.json": JSON.stringify({
      compilerOptions: {
        strict: true,
        module: "ESNext",
        moduleResolution: "Bundler",
        allowImportingTsExtensions: true,
        noEmit: true,
      },
      files: [],
      references: [
        { path: "./tsconfig.src.json" },
        { path: "./tsconfig.tests.json" },
      ],
    }),
    "tsconfig.src.json": JSON.stringify({
      extends: "./tsconfig.json",
      compilerOptions: {
        tsBuildInfoFile: "./.cache/tsconfig/src.tsbuildinfo",
      },
      include: ["src"],
    }),
    "tsconfig.tests.json": JSON.stringify({
      extends: "./tsconfig.json",
      compilerOptions: {
        tsBuildInfoFile: "./.cache/tsconfig/tests.tsbuildinfo",
      },
      include: ["tests"],
    }),
    "src/index.ts": "export const value: number = 1;\n",
    "tests/index.ts": testSource,
  });

  symlinkSync(repositoryModules, project.resolve("node_modules"));

  mockCwd(project.root);

  return project;
}

describe("engrenage typecheck", () => {
  afterEach(() => {
    process.exitCode = undefined;
  });

  test("checks every project referenced by a solution tsconfig", async () => {
    vi.spyOn(console, "info").mockImplementation(() => {});

    createSolution(
      'import { value } from "../src/index.ts";\n\nexport const text: string = value;\n',
    );

    await runCommand(tsc.tsc);

    expect(process.exitCode).not.toBe(0);
  });

  test("passes a solution whose references check", async () => {
    vi.spyOn(console, "info").mockImplementation(() => {});

    createSolution(
      'import { value } from "../src/index.ts";\n\nexport const number: number = value;\n',
    );

    await runCommand(tsc.tsc);

    expect(process.exitCode).toBe(0);
  });
});
