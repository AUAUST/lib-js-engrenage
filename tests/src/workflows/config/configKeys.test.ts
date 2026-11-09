import { describe, expectTypeOf, test } from "vitest";

import type { LoadedConfig } from "@auaust/engrenage/config";

function readKeys(config: LoadedConfig) {
  expectTypeOf(config.resolve("git")).resolves.toHaveProperty("gitignore");

  // @ts-expect-error -- `expectTypeOf` picks one overload only, so the unknown key is checked on the call itself
  void config.resolve("nope");
}

describe("config keys", () => {
  test("types each built-in key and rejects an unknown one", () => {
    expectTypeOf(readKeys).parameter(0).toEqualTypeOf<LoadedConfig>();
  });
});
