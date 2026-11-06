import { join } from "node:path";

import { afterEach, describe, expect, test, vi } from "vitest";

import { getFixture } from "#tests/utils/getFixture";
import { mockCwd } from "#tests/utils/mockCwd";
import { defineVitestConfig } from "#tools/vitest/config/defineVitestConfig";
import type { LoadedConfig } from "#project/config/types/LoadedConfig";
import type { ConfigEnv } from "#tools/vite/types/ConfigEnv";

const root = getFixture("vitest");

afterEach(() => {
  vi.restoreAllMocks();
});

describe("defineVitestConfig", () => {
  test("passes the environment and resolved config to the native config and merges it after the options", async () => {
    mockCwd(root);

    const nativeConfig = vi.fn((config: LoadedConfig, env: ConfigEnv) => {
      return {
        tsconfig: config.context.path("tsconfig.custom.json"),
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
    expect(vitestConfig.test?.exclude).toContain("tests/**/fixtures/**");
    expect(vitestConfig.test?.exclude).toContain("test");
    expect(vitestConfig.plugins).toEqual([]);
  });
});
