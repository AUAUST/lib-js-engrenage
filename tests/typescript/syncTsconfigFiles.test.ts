import { describe, expect, test } from "vitest";

import { configSchema } from "#config/config/schemas/configSchema";
import { createResolvedConfig } from "#config/utils/createResolvedConfig";
import { createTemporaryProject } from "#tests/helpers/createTemporaryProject";
import { syncTsconfigFiles } from "#typescript/setup/syncTsconfigFiles";
import { validate } from "#utils/validate";

function createProject(input: unknown, files: Record<string, string>) {
  const project = createTemporaryProject({
    "package.json": "{}",
    ...files,
  });

  const config = createResolvedConfig({
    root: project.root,
    raw: validate(configSchema, input, "test config"),
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
      include: ["src/**/*.{ts,tsx}", "env.d.ts"],
      exclude: ["dist"],
      compilerOptions: {
        lib: ["dom"],
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
          tsconfig: {
            include: false,
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
      lib: ["dom"],
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
      lib: ["dom"],
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
      "src/**/*.{ts,tsx}",
      "env.d.ts",
    ]);

    expect(() => project.read("tsconfig.tests.json")).toThrow("ENOENT");
    expect(() => project.read("tsconfig.scripts.json")).toThrow("ENOENT");
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
