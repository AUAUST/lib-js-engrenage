import { join } from "node:path";

import { describe, expect, test } from "vitest";

import { createTemporaryProject } from "#tests/helpers/createTemporaryProject";
import { getFixture } from "#tests/helpers/getFixture";
import { createTsconfig } from "#typescript/utils/createTsconfig";

describe("createTsconfig", () => {
  test("reads root-relative values once the tsconfig is used", () => {
    const root = getFixture("tsdown");

    const tsconfig = createTsconfig({
      root,
      path: join(root, "tsconfig.json"),
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
    });

    expect(tsconfig.outDir).toBe("build");
  });

  test("tolerates a missing tsconfig through the optional view only", () => {
    const root = getFixture("tsdown");

    const tsconfig = createTsconfig({
      root,
      path: undefined,
    });

    expect(tsconfig.optional.outDir).toBeUndefined();
    expect(() => tsconfig.paths).toThrow(`No tsconfig found in ${root}`);
  });

  test("fails on an unreadable tsconfig in both views", () => {
    const root = getFixture("tsconfig");

    const tsconfig = createTsconfig({
      root,
      path: join(root, "missing.json"),
    });

    expect(() => tsconfig.optional.outDir).toThrow("missing.json");
  });
});
