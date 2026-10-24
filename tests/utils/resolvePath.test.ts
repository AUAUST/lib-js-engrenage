import { resolvePath, type Directory } from "@auaust/engrenage";
import { describe, expect, expectTypeOf, test } from "vitest";

describe("resolvePath", () => {
  test("resolves string and URL bases to the same absolute path", () => {
    expectTypeOf(resolvePath).parameter(0).toEqualTypeOf<Directory | URL>();
    expect(resolvePath("/project", "src", "index.ts")).toBe(
      "/project/src/index.ts",
    );
    expect(resolvePath(new URL("file:///project/"), "src", "index.ts")).toBe(
      "/project/src/index.ts",
    );
    expect(resolvePath(new URL("file:///project"))).toBe("/project");
  });

  test("rejects URLs that are not file URLs", () => {
    expect(() => {
      return resolvePath(new URL("https://example.com/project/"));
    }).toThrow();
  });
});
