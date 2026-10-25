import { fileURLToPath } from "node:url";

import { describe, expect, test } from "vitest";

import { createTsconfig } from "#support/tsconfig/utils/createTsconfig";

const fixtures = fileURLToPath(new URL("../../fixtures/", import.meta.url));

describe("createTsconfig", () => {
  test("reads root-relative values once the tsconfig is used", () => {
    const root = `${fixtures}tsdown`;

    const tsconfig = createTsconfig({
      root,
      path: `${root}/tsconfig.json`,
    });

    expect(tsconfig.outDir).toBe("dist");
    expect(tsconfig.compilerOptions).toBe(tsconfig.optional.compilerOptions);
  });

  test("tolerates a missing tsconfig through the optional view only", () => {
    const tsconfig = createTsconfig({
      root: fixtures,
      path: undefined,
    });

    expect(tsconfig.optional.outDir).toBeUndefined();
    expect(() => tsconfig.paths).toThrow(`No tsconfig found in ${fixtures}`);
  });

  test("fails on an unreadable tsconfig in both views", () => {
    const tsconfig = createTsconfig({
      root: fixtures,
      path: `${fixtures}tsconfig/missing.json`,
    });

    expect(() => tsconfig.optional.outDir).toThrow("missing.json");
  });
});
