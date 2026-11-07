import { describe, expect, test } from "vitest";

import { selectEsLibraries } from "#project/baseline/utils/selectEsLibraries";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { withSourceRuntime } from "#tests/utils/withSourceRuntime";
import { syncTsconfigFiles } from "#tools/typescript/setup/syncTsconfigFiles";
import { createConfig } from "#workflows/registry/operations/createConfig";

async function createProject(
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

  await syncTsconfigFiles(config);

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
  test("writes managed fields and keeps every other field", async () => {
    const { project, config } = await createProject({}, files);

    await config.context.filesystem.flush();

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

  test("leaves a false list and an unmanaged scalar untouched", async () => {
    const { project, config } = await createProject(
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

    await config.context.filesystem.flush();

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

  test("writes compilerOptions over managed and custom fields", async () => {
    const { project, config } = await createProject(
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

    await config.context.filesystem.flush();

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

  test("creates the tsconfig of an active environment only", async () => {
    const { project, config } = await createProject(
      {},
      { "src/index.ts": "", "tsconfig.json": "{}" },
    );

    await config.context.filesystem.flush();

    expect(JSON.parse(project.read("tsconfig.src.json")).include).toEqual([
      "src/**/*.ts",
      "src/**/*.tsx",
      "env.d.ts",
    ]);

    expect(() => project.read("tsconfig.tests.json")).toThrow("ENOENT");
    expect(() => project.read("tsconfig.scripts.json")).toThrow("ENOENT");
  });

  test("creates a missing base tsconfig", async () => {
    const { project, config } = await createProject({}, { "src/index.ts": "" });

    await config.context.filesystem.flush();

    expect(JSON.parse(project.read("tsconfig.json"))).toEqual({
      extends: "@auaust/engrenage/tsconfig/base.json",
      files: [],
      references: [{ path: "./tsconfig.src.json" }],
    });
  });

  test("writes in the tests.dist tsconfig only the fields that differ from the tests tsconfig", async () => {
    const { project, config } = await createProject(
      {
        preset: "library",
      },
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

    await config.context.filesystem.flush();

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

  test("keeps the inherited fields of a tests.dist tsconfig that configures them", async () => {
    const { project, config } = await createProject(
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

    await config.context.filesystem.flush();

    const { include, compilerOptions } = JSON.parse(
      project.read("tsconfig.tests.dist.json"),
    );

    expect(include).toBeUndefined();
    expect(compilerOptions.lib).toEqual(["ES2025", "DOM"]);
  });

  test("reports drift without writing under --check", async () => {
    const { project, config } = await createProject({}, files);

    const outdated = config.context.filesystem.discard();

    expect(outdated.map(({ file }) => file).sort()).toEqual([
      "tsconfig.json",
      "tsconfig.src.json",
    ]);

    expect(project.read("tsconfig.src.json")).toBe(files["tsconfig.src.json"]);
  });

  test("writes verbatimModuleSyntax into the base tsconfig only when it is off and rejects a contradicting compiler option", async () => {
    const { project, config } = await createProject(
      {
        typescript: { verbatimModuleSyntax: false },
      },
      files,
    );

    await config.context.filesystem.flush();

    expect(
      JSON.parse(project.read("tsconfig.json")).compilerOptions,
    ).toMatchObject({ verbatimModuleSyntax: false });

    await expect(async () => {
      await createProject(
        {
          typescript: {
            verbatimModuleSyntax: false,
            tsconfig: {
              compilerOptions: { verbatimModuleSyntax: true },
            },
          },
        },
        files,
      );
    }).rejects.toThrow("contradicts typescript.verbatimModuleSyntax");
  });
});
