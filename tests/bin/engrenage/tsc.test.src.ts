import { statSync, symlinkSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { describe, expect, test, vi } from "vitest";

import { binaryTimeout } from "#tests/utils/binaryTimeout";
import { captureBinaryOutput } from "#tests/utils/captureBinaryOutput";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { createTestReporter } from "#tests/utils/createTestReporter";
import { mockCwd } from "#tests/utils/mockCwd";
import { runDefinition } from "#tests/utils/runDefinition";
import { checkTypes } from "#tools/typescript/tsc/index";
import { runContext } from "#workflows/cli/operations/runContext";
import { loadValidatedConfig } from "#workflows/config/index";

import tsc from "#bin/engrenage/actions/tsc";
import engrenage from "#bin/engrenage/index";

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
        {
          path: "./tsconfig.src.json",
        },
        {
          path: "./tsconfig.tests.json",
        },
      ],
    }),
    "tsconfig.src.json": JSON.stringify({
      extends: "./tsconfig.json",
      compilerOptions: {
        incremental: true,
        tsBuildInfoFile: "./.cache/tsconfig/src.tsbuildinfo",
      },
      include: ["src"],
    }),
    "tsconfig.tests.json": JSON.stringify({
      extends: "./tsconfig.json",
      compilerOptions: {
        incremental: true,
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
    const output = await captureBinaryOutput();

    createSolution(
      'import { value } from "../src/index.ts";\n\nexport const text: string = value;\n',
    );

    await runDefinition(engrenage, "typecheck");

    expect(process.exitCode).not.toBe(0);
    expect(output()).toContain("tests/index.ts(3,14): error TS2322");
  });

  test("passes a solution whose references check", async () => {
    createSolution(
      'import { value } from "../src/index.ts";\n\nexport const number: number = value;\n',
    );

    await runDefinition(engrenage, "typecheck");

    expect(process.exitCode).toBe(0);
  });

  test("reports a type error introduced after a passing incremental run", async () => {
    const output = await captureBinaryOutput();

    const project = createSolution(
      'import { value } from "../src/index.ts";\n\nexport const number: number = value;\n',
    );

    await runDefinition(engrenage, "typecheck");

    expect(process.exitCode).toBe(0);

    project.write(
      "tests/index.ts",
      'import { value } from "../src/index.ts";\n\nexport const text: string = value;\n',
    );

    await runDefinition(engrenage, "typecheck");

    expect(process.exitCode).not.toBe(0);
    expect(output()).toContain("tests/index.ts(3,14): error TS2322");
  });

  test("reports a type error another environment's change causes after a passing run", async () => {
    const output = await captureBinaryOutput();

    const project = createSolution(
      'import { value } from "../src/index.ts";\n\nexport const number: number = value;\n',
    );

    await runDefinition(engrenage, "typecheck");

    expect(process.exitCode).toBe(0);

    project.write("src/index.ts", 'export const value: string = "1";\n');

    await runDefinition(engrenage, "typecheck");

    expect(process.exitCode).not.toBe(0);
    expect(output()).toContain("tests/index.ts(3,14): error TS2322");

    const result = await checkTypes(await loadValidatedConfig());

    expect(result.ok).toBe(false);
    expect(result.output).toContain("tests/index.ts(3,14): error TS2322");
  });

  test("passes a second run with no change, reusing each tsconfig's build info", async () => {
    const project = createSolution(
      'import { value } from "../src/index.ts";\n\nexport const number: number = value;\n',
    );

    await runDefinition(engrenage, "typecheck");

    function readBuildInfoTimes() {
      return [
        ".cache/tsconfig/src.tsbuildinfo",
        ".cache/tsconfig/tests.tsbuildinfo",
      ].map((path) => statSync(project.resolve(path)).mtimeMs);
    }

    const buildInfoTimes = readBuildInfoTimes();

    await runDefinition(engrenage, "typecheck");

    expect(process.exitCode).toBe(0);
    expect(readBuildInfoTimes()).toEqual(buildInfoTimes);
  });

  test("runs each referenced project without emitting", async () => {
    const project = createSolution("export {};\n");

    expect(
      await runContext.run(
        {
          signal: new AbortController().signal,
          reporter: createTestReporter(),
        },
        () => tsc(["--pretty"]),
      ),
    ).toEqual({
      runs: [
        [
          "--project",
          project.resolve("tsconfig.src.json"),
          "--pretty",
          "--noEmit",
        ],
        [
          "--project",
          project.resolve("tsconfig.tests.json"),
          "--pretty",
          "--noEmit",
        ],
      ],
    });
  });
});

describe("engrenage typecheck environments", { timeout: binaryTimeout }, () => {
  test("names an environment with check: false as not type-checked", async () => {
    createSolution(
      'import { value } from "../src/index.ts";\n\nexport const text: string = value;\n',
      {
        "engrenage.config.ts": "export default { environments: { tests: { tsconfig: { check: false } } }, tooling: false };\n",
        "tsconfig.json": JSON.stringify({
          compilerOptions: { noEmit: true },
          files: [],
          references: [{ path: "./tsconfig.src.json" }],
        }),
      },
    );

    const reporter = await runDefinition(engrenage, "typecheck");

    expect(process.exitCode).toBe(0);

    expect(reporter.messages).toContainEqual(
      expect.objectContaining({
        level: "info",
        text: "Not type-checked: tests (check: false)",
      }),
    );
  });

  test("fails when no environment is checked", async () => {
    createSolution("export {};\n", {
      "engrenage.config.ts": "export default { environments: { src: { tsconfig: { check: false } }, tests: { tsconfig: { check: false } } }, tooling: false };\n",
      "tsconfig.json": JSON.stringify({
        compilerOptions: { noEmit: true },
        files: [],
      }),
    });

    await expect(runDefinition(engrenage, "typecheck")).rejects.toThrow(
      "No environment is type-checked: src (check: false), tests (check: false)",
    );
  });

  test("checks a project named in the arguments when no environment is checked", async () => {
    const output = await captureBinaryOutput();

    const project = createSolution("export const text: string = 1;\n", {
      "engrenage.config.ts": "export default { environments: { src: { tsconfig: { check: false } }, tests: { tsconfig: { check: false } } }, tooling: false };\n",
    });

    await runDefinition(
      engrenage,
      "typecheck",
      "-p",
      project.resolve("tsconfig.tests.json"),
    );

    expect(process.exitCode).not.toBe(0);
    expect(output()).toContain("tests/index.ts(1,14): error TS2322");
  });
});

describe("engrenage typecheck:dist", { timeout: binaryTimeout }, () => {
  test("checks the tests.dist variant", async () => {
    const output = await captureBinaryOutput();

    createSolution("export const text: string = 1;\n", {
      "engrenage.config.ts": 'export default { preset: "library" };\n',
      "tsconfig.tests.dist.json": JSON.stringify({
        extends: "./tsconfig.tests.json",
      }),
    });

    await runDefinition(engrenage, "typecheck:dist");

    expect(process.exitCode).not.toBe(0);

    expect(output()).toContain("tests/index.ts(1,14): error TS2322");
  });

  test("fails clearly when the variant is disabled", async () => {
    createSolution("export {};\n", {
      "engrenage.config.ts": "export default { tests: { dist: { tsconfig: false } } };\n",
    });

    await expect(runDefinition(engrenage, "typecheck:dist")).rejects.toThrow(
      "dist tsconfig is disabled",
    );
  });
});
