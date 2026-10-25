import { defineConfig, type Config } from "@auaust/engrenage/config";
import type { ConfigInput } from "@auaust/engrenage";
import { describe, expect, expectTypeOf, test } from "vitest";

describe("defineConfig", () => {
  test("returns the config it receives", () => {
    const config = {
      directories: {
        source: ["src", "bin"],
      },
    };

    expect(defineConfig(config)).toBe(config);
    expectTypeOf(defineConfig).returns.toEqualTypeOf<ConfigInput<Config>>();
  });

  test("accepts sync and async callbacks", () => {
    expectTypeOf(defineConfig).toBeCallableWith(() => {
      return {
        files: {
          generated: ["generated/**"],
        },
      };
    });

    expectTypeOf(defineConfig).toBeCallableWith(async () => {
      return {
        agents: {
          snippetsDirectory: ".agents/snippets",
        },
      };
    });
  });

  test("rejects unknown keys and nested typos", () => {
    defineConfig({
      // @ts-expect-error: unknown root key
      sources: ["src"],
    });

    defineConfig({
      files: {
        code: "**/*.ts",
        // @ts-expect-error: nested typo next to a valid key
        generatd: [],
      },
    });

    // @ts-expect-error: callbacks only reject keys without a valid sibling
    defineConfig(async () => {
      return {
        files: {
          generatd: [],
        },
      };
    });
  });
});
