import { afterEach, describe, expect, test, vi } from "vitest";

import { packageJsonSection, testsSection } from "#project/config/index";
import { getFixture } from "#tests/utils/getFixture";
import { mockCwd } from "#tests/utils/mockCwd";
import { defineTsdownConfig } from "#tools/tsdown/config/defineTsdownConfig";
import type { LoadedConfig } from "#project/config/types/LoadedConfig";

const root = getFixture("tsdown");

afterEach(() => {
  vi.restoreAllMocks();
});

describe("defineTsdownConfig", () => {
  test("passes the resolved config to the callbacks and merges native configs last", async () => {
    mockCwd(root);

    const callback = vi.fn(async (config: LoadedConfig) => {
      return {
        bundle: [(await config.resolve(packageJsonSection)).name],
      };
    });

    const tsdownConfig = await defineTsdownConfig(
      callback,
      {
        platform: "neutral",
      },
      async (config) => {
        return {
          exports: {
            exclude: [...(await config.resolve(testsSection)).dirs],
          },
        };
      },
    )(
      {},
      {
        ci: false,
        watch: {
          restart: vi.fn(),
          close: vi.fn(),
        },
      },
    );

    expect(callback).toHaveBeenCalledOnce();

    expect(tsdownConfig).toMatchObject({
      platform: "neutral",
      exports: {
        exclude: ["tests"],
      },
      deps: {
        onlyBundle: ["@fixture/tsdown"],
      },
      minify: false,
    });
  });
});
