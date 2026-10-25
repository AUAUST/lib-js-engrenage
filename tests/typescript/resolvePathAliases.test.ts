import { fileURLToPath } from "node:url";

import {
  resolvePathAliases,
  type PathAlias,
  type Paths,
} from "@auaust/engrenage/typescript";
import { describe, expect, expectTypeOf, test } from "vitest";

const root = fileURLToPath(
  new URL("../fixtures/typescript/aliases/", import.meta.url),
);

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
