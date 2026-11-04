import { describe, expect, test } from "vitest";

import { selectEsLibraries } from "#project/baseline/operations/selectEsLibraries";
import { syncTsconfigFiles } from "#project/tsconfig/setup/syncTsconfigFiles";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { withSourceRuntime } from "#tests/utils/withSourceRuntime";
import { createConfig } from "#workflows/registry/operations/createConfig";

function createProject(
  input: Record<string, unknown>,
  files: Record<string, string>,
) {
  const project = createTemporaryProject({
    "package.json": "{}",
    ...files,
  });

  const config = createConfig({
    root: project.root,
    raw: withSourceRuntime(input),
    configFile: undefined,
  });

  syncTsconfigFiles(config);

  return { project, config };
}

const files = {
  "src/index.ts": "",
  "tsconfig.json": JSON.stringify({
    extends: "./base.json",
    compilerOptions: { strict: true },
  }),
  "tsconfig.src.json": JSON.stringify({
    include: ["custom/**/*"],
    compilerOptions: {
      lib: ["dom"],
      module: "NodeNext",
      moduleResolution: "NodeNext",
      paths: { "#a": ["./a.ts"] },
    },
    exclude: ["dist"],
  }),
};

const buildInfoFile =
  "./node_modules/.cache/typescript/tsconfig.src.tsbuildinfo";

describe("syncTsconfigFiles", () => {
  test("writes managed fields and keeps every other field", () => {
    const { project, config } = createProject({}, files);

    config.filesystem.flush();

    expect(JSON.parse(project.read("tsconfig.src.json"))).toEqual({
      extends: "./tsconfig.json",
      include: ["src/**/*.ts", "src/**/*.tsx", "env.d.ts"],
      exclude: ["dist"],
      compilerOptions: {
        target: "ESNext",
        lib: selectEsLibraries("2026-10"),
        types: [],
        module: "NodeNext",
        moduleResolution: "NodeNext",
        paths: { "#a": ["./a.ts"] },
        tsBuildInfoFile: buildInfoFile,
      },
    });

    expect(JSON.parse(project.read("tsconfig.json"))).toEqual({
      extends: "@auaust/engrenage/tsconfig/base.json",
      files: [],
      references: [{ path: "./tsconfig.src.json" }],
      compilerOptions: { strict: true },
    });
  });

  test("leaves a false list and an unmanaged scalar untouched", () => {
    const { project, config } = createProject(
      {
        src: {
          node: 24,
          tsconfig: {
            include: false,
            lib: false,
            unmanaged: ["compilerOptions.tsBuildInfoFile"],
          },
        },
      },
      files,
    );

    config.filesystem.flush();

    const tsconfig = JSON.parse(project.read("tsconfig.src.json"));

    expect(tsconfig.extends).toBe("./tsconfig.json");
    expect(tsconfig.include).toEqual(["custom/**/*"]);

    expect(tsconfig.compilerOptions).toEqual({
      target: "ESNext",
      lib: ["dom"],
      types: ["node"],
      module: "NodeNext",
      moduleResolution: "NodeNext",
      paths: { "#a": ["./a.ts"] },
    });
  });

  test("writes compilerOptions over managed and custom fields", () => {
    const { project, config } = createProject(
      {
        src: {
          tsconfig: {
            compilerOptions: {
              tsBuildInfoFile: "./custom.tsbuildinfo",
              customFlag: { a: 1 },
            },
          },
        },
      },
      files,
    );

    config.filesystem.flush();

    expect(
      JSON.parse(project.read("tsconfig.src.json")).compilerOptions,
    ).toEqual({
      target: "ESNext",
      lib: selectEsLibraries("2026-10"),
      types: [],
      module: "NodeNext",
      moduleResolution: "NodeNext",
      paths: { "#a": ["./a.ts"] },
      tsBuildInfoFile: "./custom.tsbuildinfo",
      customFlag: { a: 1 },
    });
  });

  test("creates the tsconfig of an active environment only", () => {
    const { project, config } = createProject(
      {},
      { "src/index.ts": "", "tsconfig.json": "{}" },
    );

    config.filesystem.flush();

    expect(JSON.parse(project.read("tsconfig.src.json")).include).toEqual([
      "src/**/*.ts",
      "src/**/*.tsx",
      "env.d.ts",
    ]);

    expect(() => project.read("tsconfig.tests.json")).toThrow("ENOENT");
    expect(() => project.read("tsconfig.scripts.json")).toThrow("ENOENT");
  });

  test("creates a missing base tsconfig", () => {
    const { project, config } = createProject({}, { "src/index.ts": "" });

    config.filesystem.flush();

    expect(JSON.parse(project.read("tsconfig.json"))).toEqual({
      extends: "@auaust/engrenage/tsconfig/base.json",
      files: [],
      references: [{ path: "./tsconfig.src.json" }],
    });
  });

  test("writes in the tests.dist tsconfig only the fields that differ from the tests tsconfig", () => {
    const { project, config } = createProject(
      {},
      {
        "tests/index.test.ts": "",
        "tsconfig.json": "{}",
        "tsconfig.tests.dist.json": JSON.stringify({
          include: ["stale/**/*.ts"],
          compilerOptions: {
            target: "ES5",
            lib: ["ES5"],
            strict: true,
          },
        }),
      },
    );

    config.filesystem.flush();

    expect(JSON.parse(project.read("tsconfig.tests.dist.json"))).toEqual({
      extends: "./tsconfig.tests.json",
      compilerOptions: {
        strict: true,
        paths: {},
        skipLibCheck: false,
        tsBuildInfoFile:
          "./node_modules/.cache/typescript/tsconfig.tests.dist.tsbuildinfo",
      },
    });
  });

  test("keeps the inherited fields of a tests.dist tsconfig that configures them", () => {
    const { project, config } = createProject(
      {
        tests: {
          dist: {
            tsconfig: { lib: ["ES2025", "DOM"] },
          },
        },
      },
      {
        "tests/index.test.ts": "",
        "tsconfig.json": "{}",
      },
    );

    config.filesystem.flush();

    const { include, compilerOptions } = JSON.parse(
      project.read("tsconfig.tests.dist.json"),
    );

    expect(include).toBeUndefined();
    expect(compilerOptions.lib).toEqual(["ES2025", "DOM"]);
  });

  test("reports drift without writing under --check", () => {
    const { project, config } = createProject({}, files);

    const outdated = config.filesystem.discard();

    expect(outdated.map(({ file }) => file).sort()).toEqual([
      "tsconfig.json",
      "tsconfig.src.json",
    ]);

    expect(project.read("tsconfig.src.json")).toBe(files["tsconfig.src.json"]);
  });
});
