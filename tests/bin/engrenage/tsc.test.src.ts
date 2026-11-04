import { symlinkSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { describe, expect, test, vi } from "vitest";

import { tsc } from "#bin/engrenage/tsc";
import { binaryTimeout } from "#tests/utils/binaryTimeout";
import { captureBinaryOutput } from "#tests/utils/captureBinaryOutput";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { mockCwd } from "#tests/utils/mockCwd";
import { runCommand } from "#tests/utils/runCommand";

vi.mock(import("node:child_process"), { spy: true });

const repositoryModules = fileURLToPath(
  new URL("../../../node_modules", import.meta.url),
);

function createSolution(
  testSource: string,
  files: Record<string, string> = {},
) {
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
    ...files,
  });

  symlinkSync(repositoryModules, project.resolve("node_modules"));

  mockCwd(project.root);

  return project;
}

describe("engrenage typecheck", { timeout: binaryTimeout }, () => {
  test("checks every project referenced by a solution tsconfig", async () => {
    vi.spyOn(console, "info").mockImplementation(() => {});

    const output = await captureBinaryOutput();

    createSolution(
      'import { value } from "../src/index.ts";\n\nexport const text: string = value;\n',
    );

    await runCommand(tsc.tsc);

    expect(process.exitCode).not.toBe(0);
    expect(output()).toContain("tests/index.ts(3,14): error TS2322");
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

describe("engrenage typecheck environments", { timeout: binaryTimeout }, () => {
  test("skips an environment with check: false", async () => {
    vi.spyOn(console, "info").mockImplementation(() => {});

    createSolution(
      'import { value } from "../src/index.ts";\n\nexport const text: string = value;\n',
      {
        "engrenage.config.ts":
          "export default { tests: { tsconfig: { check: false } } };\n",
        "tsconfig.json": JSON.stringify({
          compilerOptions: { noEmit: true },
          files: [],
          references: [{ path: "./tsconfig.src.json" }],
        }),
      },
    );

    await runCommand(tsc.tsc);

    expect(process.exitCode).toBe(0);
  });

  test("fails when no environment is referenced", async () => {
    vi.spyOn(console, "info").mockImplementation(() => {});

    createSolution("export {};\n", {
      "engrenage.config.ts":
        "export default { src: { tsconfig: { check: false } }, tests: { tsconfig: { check: false } } };\n",
      "tsconfig.json": JSON.stringify({
        compilerOptions: { noEmit: true },
        files: [],
      }),
    });

    await expect(runCommand(tsc.tsc)).rejects.toThrow(
      "No environment is referenced",
    );
  });
});

describe("engrenage typecheck:dist", { timeout: binaryTimeout }, () => {
  test("checks the tests.dist variant", async () => {
    vi.spyOn(console, "info").mockImplementation(() => {});

    const output = await captureBinaryOutput();

    createSolution("export const text: string = 1;\n", {
      "engrenage.config.ts": 'export default { preset: "library" };\n',
      "tsconfig.tests.dist.json": JSON.stringify({
        extends: "./tsconfig.tests.json",
      }),
    });

    await runCommand(tsc["tsc:dist"]);

    expect(process.exitCode).not.toBe(0);
    expect(output()).toContain("tests/index.ts(1,14): error TS2322");
  });

  test("fails clearly when the variant is disabled", async () => {
    createSolution("export {};\n", {
      "engrenage.config.ts":
        "export default { tests: { dist: { tsconfig: false } } };\n",
    });

    await expect(runCommand(tsc["tsc:dist"])).rejects.toThrow(
      "dist tsconfig is disabled",
    );
  });
});
