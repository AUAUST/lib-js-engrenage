import { describe, expect, expectTypeOf, test } from "vitest";

import {
  resolvePathAliases,
  type PathAliases,
  type Paths,
} from "@auaust/engrenage/typescript";

import { getFixture } from "#tests/helpers/getFixture";

const root = getFixture("typescript/aliases");

describe("resolvePathAliases", () => {
  test("resolves exact and wildcard package aliases to entrypoints and skips the others", () => {
    const aliases = resolvePathAliases(
      "@scope/package",
      {
        "~/*": ["./src/*"],
        "@scope/package/*": ["./src/*/index.ts"],
        "@scope/package": ["./src/main.ts"],
      },
      root,
    );

    expectTypeOf(resolvePathAliases).parameter(1).toEqualTypeOf<Paths>();
    expectTypeOf(aliases).toEqualTypeOf<PathAliases>();

    expect(aliases).toEqual([
      {
        name: "group/index",
        path: "src/group/index.ts",
      },
      {
        name: "index",
        path: "src/main.ts",
      },
    ]);
  });

  test("rejects wildcards without a match on each side", () => {
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
