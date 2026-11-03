import { join } from "node:path";

import { describe, expect, test } from "vitest";

import { createFilesystem } from "#config/utils/createFilesystem";
import { createTemporaryProject } from "#tests/helpers/createTemporaryProject";
import { getFixture } from "#tests/helpers/getFixture";
import { createTsconfig } from "#typescript/utils/createTsconfig";

describe("createTsconfig", () => {
  test("reads root-relative values once the tsconfig is used", () => {
    const root = getFixture("tsdown");

    const tsconfig = createTsconfig({
      root,
      path: join(root, "tsconfig.json"),
      filesystem: createFilesystem(root),
    });

    expect(tsconfig.outDir).toBe("dist");
    expect(tsconfig.compilerOptions).toBe(tsconfig.optional.compilerOptions);
  });

  test("reads the compiler options of a tsconfig that matches no file yet", () => {
    const project = createTemporaryProject({
      "tsconfig.json": JSON.stringify({
        compilerOptions: {
          outDir: "build",
        },
      }),
    });

    const tsconfig = createTsconfig({
      root: project.root,
      path: project.resolve("tsconfig.json"),
      filesystem: createFilesystem(project.root),
    });

    expect(tsconfig.outDir).toBe("build");
  });

  test("keeps an outDir outside the root relative to it and rejects the root itself", () => {
    const project = createTemporaryProject({
      "outside.json": JSON.stringify({
        compilerOptions: {
          outDir: "../build",
        },
      }),
      "root.json": JSON.stringify({
        compilerOptions: {
          outDir: ".",
        },
      }),
    });

    const outside = createTsconfig({
      root: project.root,
      path: project.resolve("outside.json"),
      filesystem: createFilesystem(project.root),
    });

    const atRoot = createTsconfig({
      root: project.root,
      path: project.resolve("root.json"),
      filesystem: createFilesystem(project.root),
    });

    expect(outside.outDir).toBe("../build");

    expect(() => atRoot.outDir).toThrow(
      "sets compilerOptions.outDir to the project root",
    );
  });

  test("tolerates a missing tsconfig through the optional view only", () => {
    const root = getFixture("tsdown");

    const tsconfig = createTsconfig({
      root,
      path: undefined,
      filesystem: createFilesystem(root),
    });

    expect(tsconfig.optional.outDir).toBeUndefined();
    expect(() => tsconfig.paths).toThrow(`No tsconfig found in ${root}`);
  });

  test("fails on an unreadable tsconfig in both views", () => {
    const root = getFixture("tsconfig");

    const tsconfig = createTsconfig({
      root,
      path: join(root, "missing.json"),
      filesystem: createFilesystem(root),
    });

    expect(() => tsconfig.optional.outDir).toThrow("missing.json");
  });
});
