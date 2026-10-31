import { describe, expect, test, vi } from "vitest";

import { configSchema } from "#config/config/schemas/configSchema";
import { createResolvedConfig } from "#config/utils/createResolvedConfig";
import { createTemporaryProject } from "#tests/helpers/createTemporaryProject";
import { syncTsconfigFiles } from "#typescript/setup/syncTsconfigFiles";
import { validate } from "#utils/validate";

vi.mock("#typescript/setup/tsconfigProducers", () => {
  return {
    tsconfigProducers: [
      (_config: unknown, { key }: { key: string }) => {
        return [
          { path: ["include"], value: [`${key}/**/*`] },
          { path: ["compilerOptions", "lib"], value: ["es2024"] },
          { path: ["compilerOptions", "target"], value: "es2024" },
        ];
      },
    ],
  };
});

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
    compilerOptions: {
      lib: ["dom"],
      paths: { "#a": ["./a.ts"] },
    },
    exclude: ["dist"],
  }),
};

describe("syncTsconfigFiles", () => {
  test("writes managed fields and keeps every other field", () => {
    const { project, config } = createProject({}, files);

    config.filesystem.flush();

    expect(JSON.parse(project.read("tsconfig.src.json"))).toEqual({
      include: ["src/**/*"],
      exclude: ["dist"],
      compilerOptions: {
        lib: ["es2024"],
        target: "es2024",
        paths: { "#a": ["./a.ts"] },
      },
    });

    expect(JSON.parse(project.read("tsconfig.json"))).toEqual({
      extends: "./base.json",
      include: ["base/**/*"],
      compilerOptions: {
        strict: true,
        lib: ["es2024"],
        target: "es2024",
      },
    });
  });

  test("leaves a false list and an unmanaged scalar untouched", () => {
    const { project, config } = createProject(
      {
        src: {
          tsconfig: { lib: false, unmanaged: ["compilerOptions.target"] },
        },
      },
      files,
    );

    config.filesystem.flush();

    const { include, compilerOptions } = JSON.parse(
      project.read("tsconfig.src.json"),
    );

    expect(include).toEqual(["src/**/*"]);

    expect(compilerOptions).toEqual({
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
              target: "es2025",
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
      lib: ["es2024"],
      target: "es2025",
      customFlag: { a: 1 },
      paths: { "#a": ["./a.ts"] },
    });
  });

  test("creates the tsconfig of an active environment only", () => {
    const { project, config } = createProject(
      {},
      { "src/index.ts": "", "tsconfig.json": "{}" },
    );

    config.filesystem.flush();

    expect(JSON.parse(project.read("tsconfig.src.json")).include).toEqual([
      "src/**/*",
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
