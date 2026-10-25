import { defineConfig, type Config } from "@auaust/engrenage/config";
import { describe, expect, expectTypeOf, test } from "vitest";

describe("defineConfig", () => {
  test("returns the config it receives", () => {
    const config = {
      directories: {
        source: ["src", "bin"],
      },
    };

    expect(defineConfig(config)).toBe(config);
    expectTypeOf(defineConfig).returns.toEqualTypeOf<Config>();
  });

  test("rejects unknown keys and nested typos", () => {
    defineConfig({
      // @ts-expect-error: unknown root key
      sources: ["src"],
    });

    defineConfig({
      files: {
        // @ts-expect-error: nested typo
        generatd: [],
      },
    });
  });
});
