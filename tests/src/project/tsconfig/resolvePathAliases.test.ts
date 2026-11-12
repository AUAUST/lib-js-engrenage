import { describe, expect, expectTypeOf, test } from "vitest";

import {
  resolvePathAliases,
  type PathAliases,
  type Paths,
} from "@auaust/engrenage/typescript";

import { getFixture } from "#tests/utils/getFixture";

const root = getFixture("typescript/aliases");

describe("resolvePathAliases", () => {
  test("resolves exact and wildcard package aliases to entrypoints and skips the others", async () => {
    const resolving = resolvePathAliases(
      "@scope/package",
      {
        "~/*": ["./src/*"],
        "@scope/package/*": ["./src/*/index.ts"],
        "@scope/package": ["./src/main.ts"],
      },
      root,
    );

    expectTypeOf(resolvePathAliases).parameter(1).toEqualTypeOf<Paths>();

    expectTypeOf(resolving).toEqualTypeOf<Promise<PathAliases>>();

    const aliases = await resolving;

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

  test("rejects wildcards without a match on each side", async () => {
    await expect(
      resolvePathAliases(
        "@scope/package",
        {
          "@scope/package/*": ["./src/main.ts"],
        },
        root,
      ),
    ).rejects.toThrow("need exactly one '*'");
  });

  test("rejects an exact alias without a file", async () => {
    await expect(
      resolvePathAliases(
        "@scope/package",
        {
          "@scope/package/missing": ["./src/missing.ts"],
        },
        root,
      ),
    ).rejects.toThrow("does not resolve to a file");
  });
});
