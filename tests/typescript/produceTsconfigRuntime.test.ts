import { describe, expect, test } from "vitest";

import { configSchema } from "#config/config/schemas/configSchema";
import { createResolvedConfig } from "#config/utils/createResolvedConfig";
import { createTemporaryProject } from "#tests/helpers/createTemporaryProject";
import { syncTsconfigFiles } from "#typescript/setup/syncTsconfigFiles";
import { validate } from "#utils/validate";

function syncCompilerOptions(
  input: unknown,
  project = createTemporaryProject(),
) {
  project.write("package.json", "{}");
  project.write("src/index.ts", "");
  project.write("bin/index.ts", "");
  project.write("tsconfig.json", "{}");

  const config = createResolvedConfig({
    root: project.root,
    raw: validate(configSchema, input, "test config"),
    configFile: undefined,
  });

  syncTsconfigFiles(config);
  config.filesystem.flush();

  return (file: string) => JSON.parse(project.read(file)).compilerOptions;
}

describe("runtime tsconfig fields", () => {
  test("writes a baseline snapshot's target and libs with no types", () => {
    const read = syncCompilerOptions({
      src: { baseline: "2026-10" },
    });

    expect(read("tsconfig.src.json")).toMatchObject({
      target: "ES2024",
      lib: expect.arrayContaining(["ES2022", "ES2024.String"]),
      types: [],
    });
  });

  test("writes a Node major's target, libs and types", () => {
    const read = syncCompilerOptions({
      bin: { node: 24 },
    });

    expect(read("tsconfig.bin.json")).toEqual(
      expect.objectContaining({
        target: "ES2025",
        lib: ["ES2025"],
        types: ["node"],
      }),
    );
  });

  test("appends to the libs and lets compilerOptions pin the target", () => {
    const read = syncCompilerOptions({
      src: {
        tsconfig: {
          lib: { append: ["DOM"] },
          compilerOptions: { target: "ES2022" },
        },
      },
    });

    const { lib, target } = read("tsconfig.src.json");

    expect(lib.at(-1)).toBe("DOM");
    expect(target).toBe("ES2022");
  });

  test("switches the fields when the snapshot changes", () => {
    const project = createTemporaryProject();

    syncCompilerOptions(
      {
        src: { baseline: "2026-10" },
      },
      project,
    );

    const read = syncCompilerOptions(
      {
        src: { node: 24 },
      },
      project,
    );

    expect(read("tsconfig.src.json")).toMatchObject({
      target: "ES2025",
      types: ["node"],
    });
  });
});
