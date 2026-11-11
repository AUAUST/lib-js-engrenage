import { describe, expect, expectTypeOf, test } from "vitest";

import { defineConfig, type ConfigInput } from "@auaust/engrenage/config";
import type { Resolvable } from "@auaust/engrenage";

declare global {
  namespace Engrenage {
    interface Slots {
      "test.entries": { readonly name: string };
    }
  }
}

describe("defineConfig", () => {
  test("returns the config it receives", () => {
    const config = {
      src: {
        dirs: ["src", "lib"],
      },
      tests: {
        dirs: "tests",
      },
    };

    expect(defineConfig(config)).toBe(config);
    expectTypeOf(defineConfig).returns.toEqualTypeOf<Resolvable<ConfigInput>>();
  });

  test("types src.apis with the known groups", () => {
    expectTypeOf(defineConfig).toBeCallableWith({
      src: { baseline: "2026-10", apis: ["timers"] },
    });

    type Apis = NonNullable<Extract<ConfigInput["src"], object>["apis"]>;

    expectTypeOf<["timers"]>().toExtend<Apis>();
    expectTypeOf<["unknown"]>().not.toExtend<Apis>();
  });

  test("types names that sub-domain extensions contribute", () => {
    expectTypeOf(defineConfig).toBeCallableWith({
      preset: "shopify-theme",
      agents: { preferred: ["claude", "codex"] },
    });

    defineConfig({
      agents: {
        // @ts-expect-error: unknown agent runtime
        preferred: ["unknown"],
      },
    });
  });

  test("types entries contributed to an augmented slot", () => {
    expectTypeOf(defineConfig).toBeCallableWith({
      extensions: [
        {
          name: "test",
          contributes: { "test.entries": [{ name: "entry" }] },
        },
      ],
    });

    defineConfig({
      extensions: [
        {
          name: "test",
          contributes: {
            // @ts-expect-error: entry of the wrong shape
            "test.entries": [{ title: "entry" }],
          },
        },
      ],
    });
  });

  test("accepts sync and async callbacks", () => {
    expectTypeOf(defineConfig).toBeCallableWith(() => {
      return {
        src: {
          generated: ["generated/**"],
        },
      };
    });

    expectTypeOf(defineConfig).toBeCallableWith(() => {
      return Promise.resolve({
        agents: {
          snippetsDir: ".agents/snippets",
        },
      });
    });
  });

  test("rejects unknown keys and nested typos", () => {
    defineConfig({
      // @ts-expect-error: unknown root key
      sources: ["src"],
    });

    defineConfig({
      src: {
        dirs: "src",
        // @ts-expect-error: nested typo next to a valid key
        generatedd: [],
      },
    });

    // @ts-expect-error: callbacks only reject keys without a valid sibling
    defineConfig(() => {
      return Promise.resolve({
        src: {
          generatedd: [],
        },
      });
    });
  });
});
