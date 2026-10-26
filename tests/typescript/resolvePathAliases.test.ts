import { describe, expect, expectTypeOf, test } from "vitest";

import {
  resolvePathAliases,
  type PathAlias,
  type Paths,
} from "@auaust/engrenage/typescript";

import { getFixture } from "#tests/helpers/getFixture";

const root = getFixture("typescript/aliases");

describe("resolvePathAliases", () => {
  test("resolves exact and wildcard aliases to entrypoints", () => {
    const aliases = resolvePathAliases(
      "@scope/package",
      {
        "@scope/package/*": ["./src/*/index.ts"],
        "@scope/package": ["./src/main.ts"],
      },
      root,
    );

    expectTypeOf(resolvePathAliases).parameter(1).toEqualTypeOf<Paths>();
    expectTypeOf(aliases).toEqualTypeOf<PathAlias[]>();
    expect(aliases).toEqual([
      {
        alias: "@scope/package/group",
        name: "group/index",
        path: "src/group/index.ts",
      },
      {
        alias: "@scope/package",
        name: "index",
        path: "src/main.ts",
      },
    ]);
  });

  test("rejects aliases outside the package and wildcards without a match on each side", () => {
    expect(() => {
      return resolvePathAliases(
        "@scope/package",
        {
          "@/*": ["./src/*"],
        },
        root,
      );
    }).toThrow("is outside the package '@scope/package'");

    expect(() => {
      return resolvePathAliases(
        "@scope/package",
        {
          "@scope/package/*": ["./src/main.ts"],
        },
        root,
      );
    }).toThrow("need exactly one '*'");
  });

  test("rejects an exact alias without a file", () => {
    expect(() => {
      return resolvePathAliases(
        "@scope/package",
        {
          "@scope/package/missing": ["./src/missing.ts"],
        },
        root,
      );
    }).toThrow("does not resolve to a file");
  });
});
