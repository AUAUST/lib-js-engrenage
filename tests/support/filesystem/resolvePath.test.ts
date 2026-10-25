import { describe, expect, expectTypeOf, test } from "vitest";
import type { Directory } from "@auaust/engrenage";

import { resolve } from "#support/filesystem/utils/resolve";

describe("resolvePath", () => {
  test("resolves string and URL bases to the same absolute path", () => {
    expectTypeOf(resolve).parameter(0).toEqualTypeOf<Directory | URL>();
    expect(resolve("/project", "src", "index.ts")).toBe(
      "/project/src/index.ts",
    );
    expect(resolve(new URL("file:///project/"), "src", "index.ts")).toBe(
      "/project/src/index.ts",
    );
    expect(resolve(new URL("file:///project"))).toBe("/project");
  });

  test("rejects URLs that are not file URLs", () => {
    expect(() => {
      return resolve(new URL("https://example.com/project/"));
    }).toThrow();
  });
});
