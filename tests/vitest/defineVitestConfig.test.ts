import { join } from "node:path";
import { fileURLToPath } from "node:url";

import { defineVitestConfig } from "@auaust/engrenage/vitest";
import { afterEach, describe, expect, test, vi } from "vitest";
import type { ResolvedConfig } from "@auaust/engrenage/config";
import type { ConfigEnv } from "@auaust/engrenage/vite";

const root = fileURLToPath(new URL("../fixtures/vitest", import.meta.url));

afterEach(() => {
  vi.restoreAllMocks();
});

describe("defineVitestConfig", () => {
  test("passes the environment and resolved config to the native config and merges it last", async () => {
    vi.spyOn(process, "cwd").mockReturnValue(root);

    const nativeConfig = vi.fn((env: ConfigEnv, config: ResolvedConfig) => {
      return {
        tsconfig: config.resolve("tsconfig.custom.json"),
        test: {
          exclude: [env.mode],
        },
      };
    });

    const vitestConfig = await defineVitestConfig(nativeConfig, {
      guardOutDir: false,
    })({
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
