import { join } from "node:path";

import { afterEach, describe, expect, test, vi } from "vitest";

import { defineVitestConfig } from "@auaust/engrenage/vitest";
import type { ResolvedConfig } from "@auaust/engrenage/config";
import type { ConfigEnv } from "@auaust/engrenage/vite";

import { getFixture } from "#tests/helpers/getFixture";
import { mockCwd } from "#tests/helpers/mockCwd";

const root = getFixture("vitest");

afterEach(() => {
  vi.restoreAllMocks();
});

describe("defineVitestConfig", () => {
  test("passes the environment and resolved config to the native config and merges it after the options", async () => {
    mockCwd(root);

    const nativeConfig = vi.fn((env: ConfigEnv, config: ResolvedConfig) => {
      return {
        tsconfig: config.resolve("tsconfig.custom.json"),
        test: {
          exclude: [env.mode],
        },
      };
    });

    const vitestConfig = await defineVitestConfig(
      {
        guardOutDir: false,
      },
      nativeConfig,
    )({
      command: "serve",
      mode: "test",
    });

    expect(nativeConfig).toHaveBeenCalledOnce();
    expect(vitestConfig.tsconfig).toBe(join(root, "tsconfig.custom.json"));
    expect(vitestConfig.test?.exclude).toContain("**/fixtures/**");
    expect(vitestConfig.test?.exclude).toContain("test");
    expect(vitestConfig.plugins).toEqual([]);
  });
});
