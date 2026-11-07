import { symlinkSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { describe, expect, test, vi } from "vitest";

import { tsc } from "#bin/engrenage/tsc";
import { createProjectConfig } from "#project/config/operations/createProjectConfig";
import { binaryTimeout } from "#tests/utils/binaryTimeout";
import { captureBinaryOutput } from "#tests/utils/captureBinaryOutput";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { mockCwd } from "#tests/utils/mockCwd";
import { runCommand } from "#tests/utils/runCommand";
import { withSourceRuntime } from "#tests/utils/withSourceRuntime";
import { syncTsconfigFiles } from "#tools/typescript/setup/syncTsconfigFiles";

vi.mock(import("node:child_process"), { spy: true });

const repositoryModules = fileURLToPath(
  new URL("../../../../node_modules", import.meta.url),
);

async function syncProject(input: Record<string, unknown>, testSource = "") {
  const project = createTemporaryProject({
    "package.json": '{"name":"project","type":"module"}',
    "src/index.ts": "export const value: number = 1;\n",
    "tests/index.ts": testSource,
    "bin/index.ts": "",
    "scripts/index.ts": "",
    "tsconfig.json": "{}",
  });

  const config = createProjectConfig({
    root: project.root,
    raw: withSourceRuntime(input),
    configFile: undefined,
  });

  await syncTsconfigFiles(config);
  await config.context.filesystem.flush();

  return {
    project,
    read: (file: string) => JSON.parse(project.read(file)),
  };
}

describe("solution tsconfig", () => {
  test("references the owned environments that are checked", async () => {
    const { read } = await syncProject({});

    expect(read("tsconfig.json").files).toEqual([]);

    expect(read("tsconfig.json").references).toEqual([
      { path: "./tsconfig.src.json" },
      { path: "./tsconfig.tests.json" },
      { path: "./tsconfig.bin.json" },
      { path: "./tsconfig.scripts.json" },
    ]);
  });

  test("skips an environment with check false and an inheriting one", async () => {
    const { read } = await syncProject({
      tests: {
        tsconfig: { check: false },
      },
      scripts: {
        tsconfig: { inherits: "bin" },
      },
    });

    expect(read("tsconfig.json").references).toEqual([
      { path: "./tsconfig.src.json" },
      { path: "./tsconfig.bin.json" },
    ]);
  });

  test("never references the tests.dist variant", async () => {
    const { read } = await syncProject({
      tests: {
        dist: {
          tsconfig: { path: "tsconfig.tests.dist.json" },
        },
      },
    });

    expect(JSON.stringify(read("tsconfig.json").references)).not.toContain(
      "dist",
    );
  });
});

describe("tsconfig build info", () => {
  test("goes to the typescript cache named after the tsconfig", async () => {
    const { read } = await syncProject({
      tests: {
        dist: {
          tsconfig: { path: "tsconfig.tests.dist.json" },
        },
      },
    });

    expect(read("tsconfig.src.json").compilerOptions.tsBuildInfoFile).toBe(
      "./node_modules/.cache/typescript/tsconfig.src.tsbuildinfo",
    );

    expect(
      read("tsconfig.tests.dist.json").compilerOptions.tsBuildInfoFile,
    ).toBe("./node_modules/.cache/typescript/tsconfig.tests.dist.tsbuildinfo");

    expect(read("tsconfig.json").compilerOptions).toBeUndefined();
  });

  test("follows a custom cache.dir", async () => {
    const { read } = await syncProject({
      cache: { dir: ".cache" },
    });

    expect(read("tsconfig.bin.json").compilerOptions.tsBuildInfoFile).toBe(
      "./.cache/typescript/tsconfig.bin.tsbuildinfo",
    );
  });

  test("is relative to a tsconfig in a subdirectory", async () => {
    const { read } = await syncProject({
      src: {
        tsconfig: { path: "config/tsconfig.src.json" },
      },
    });

    expect(
      read("config/tsconfig.src.json").compilerOptions.tsBuildInfoFile,
    ).toBe("../node_modules/.cache/typescript/tsconfig.src.tsbuildinfo");
  });
});

describe("tests.dist skipLibCheck", () => {
  test("is false in the variant only", async () => {
    const { read } = await syncProject({
      tests: {
        dist: {
          tsconfig: { path: "tsconfig.tests.dist.json" },
        },
      },
    });

    expect(read("tsconfig.tests.dist.json").compilerOptions.skipLibCheck).toBe(
      false,
    );

    expect(
      read("tsconfig.tests.json").compilerOptions.skipLibCheck,
    ).toBeUndefined();
  });
});

describe(
  "engrenage typecheck on a synced project",
  { timeout: binaryTimeout },
  () => {
    const options = {
      strict: true,
      module: "ESNext",
      moduleResolution: "Bundler",
      allowImportingTsExtensions: true,
      noEmit: true,
    };

    const input = {
      cache: { dir: ".cache" },
      typescript: {
        files: "**/*.ts",
        tsconfig: { extends: false, compilerOptions: options },
      },
    };

    async function typecheck(testSource: string) {
      vi.spyOn(console, "info").mockImplementation(() => {});

      const { project } = await syncProject(input, testSource);

      symlinkSync(repositoryModules, project.resolve("node_modules"));
      mockCwd(project.root);

      await runCommand(tsc.tsc);
    }

    test("passes when every referenced environment checks", async () => {
      await typecheck(
        'import { value } from "../src/index.ts";\n\nexport const number: number = value;\n',
      );

      expect(process.exitCode).toBe(0);
    });

    test("fails on a type error in a test", async () => {
      const output = await captureBinaryOutput();

      await typecheck(
        'import { value } from "../src/index.ts";\n\nexport const text: string = value;\n',
      );

      expect(process.exitCode).not.toBe(0);
      expect(output()).toContain("tests/index.ts(3,14): error TS2322");
    });
  },
);
