import { describe, expect, expectTypeOf, test } from "vitest";

import { defineConfig, type Config } from "@auaust/engrenage/config";
import type { ConfigInput } from "@auaust/engrenage";

describe("defineConfig", () => {
  test("returns the config it receives", () => {
    const config = {
      source: {
        dirs: ["src", "lib"],
      },
      test: {
        dirs: "tests",
      },
    };

    expect(defineConfig(config)).toBe(config);
    expectTypeOf(defineConfig).returns.toEqualTypeOf<ConfigInput<Config>>();
  });

  test("accepts sync and async callbacks", () => {
    expectTypeOf(defineConfig).toBeCallableWith(() => {
      return {
        code: {
          generatedFiles: ["generated/**"],
        },
      };
    });

    expectTypeOf(defineConfig).toBeCallableWith(async () => {
      return {
        agents: {
          snippetsDir: ".agents/snippets",
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
      code: {
        files: "**/*.ts",
        // @ts-expect-error: nested typo next to a valid key
        configFilez: [],
      },
    });

    // @ts-expect-error: callbacks only reject keys without a valid sibling
    defineConfig(async () => {
      return {
        code: {
          configFilez: [],
        },
      };
    });
  });
});
