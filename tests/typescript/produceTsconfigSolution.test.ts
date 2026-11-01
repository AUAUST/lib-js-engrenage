import { symlinkSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { afterEach, describe, expect, test, vi } from "vitest";

import { configSchema } from "#config/config/schemas/configSchema";
import { createResolvedConfig } from "#config/utils/createResolvedConfig";
import { binaryTimeout } from "#tests/helpers/binaryTimeout";
import { createTemporaryProject } from "#tests/helpers/createTemporaryProject";
import { mockCwd } from "#tests/helpers/mockCwd";
import { runCommand } from "#tests/helpers/runCommand";
import { syncTsconfigFiles } from "#typescript/setup/syncTsconfigFiles";
import { validate } from "#utils/validate";

import tsc from "#bin/engrenage/tsc";

const repositoryModules = fileURLToPath(
  new URL("../../node_modules", import.meta.url),
);

function syncProject(input: unknown, testSource = "") {
  const project = createTemporaryProject({
    "package.json": '{"name":"project","type":"module"}',
    "src/index.ts": "export const value: number = 1;\n",
    "tests/index.ts": testSource,
    "bin/index.ts": "",
    "scripts/index.ts": "",
    "tsconfig.json": "{}",
  });

  const config = createResolvedConfig({
    root: project.root,
    raw: validate(configSchema, input, "test config"),
    configFile: undefined,
  });

  syncTsconfigFiles(config);
  config.filesystem.flush();

  return {
    project,
    read: (file: string) => JSON.parse(project.read(file)),
  };
}

describe("solution tsconfig", () => {
  test("references the owned environments that are checked", () => {
    const { read } = syncProject({});

    expect(read("tsconfig.json").files).toEqual([]);

    expect(read("tsconfig.json").references).toEqual([
      { path: "./tsconfig.src.json" },
      { path: "./tsconfig.tests.json" },
      { path: "./tsconfig.bin.json" },
      { path: "./tsconfig.scripts.json" },
    ]);
  });

  test("skips an environment with check false and an inheriting one", () => {
    const { read } = syncProject({
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

  test("never references the tests.dist variant", () => {
    const { read } = syncProject({
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
  test("goes to the typescript cache named after the tsconfig", () => {
    const { read } = syncProject({
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

  test("follows a custom cache.dir", () => {
    const { read } = syncProject({
      cache: { dir: ".cache" },
    });

    expect(read("tsconfig.bin.json").compilerOptions.tsBuildInfoFile).toBe(
      "./.cache/typescript/tsconfig.bin.tsbuildinfo",
    );
  });

  test("is relative to a tsconfig in a subdirectory", () => {
    const { read } = syncProject({
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
  test("is false in the variant only", () => {
    const { read } = syncProject({
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
    afterEach(() => {
      process.exitCode = undefined;
    });

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

      const { project } = syncProject(input, testSource);

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
      await typecheck(
        'import { value } from "../src/index.ts";\n\nexport const text: string = value;\n',
      );

      expect(process.exitCode).not.toBe(0);
    });
  },
);
