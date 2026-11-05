import { afterEach, describe, expect, test, vi } from "vitest";

import { getFixture } from "#tests/utils/getFixture";
import { mockCwd } from "#tests/utils/mockCwd";
import { defineTsdownConfig } from "#tools/tsdown/definers/defineTsdownConfig";
import type { ConfigContext } from "#project/config/types/ConfigContext";

const root = getFixture("tsdown");

afterEach(() => {
  vi.restoreAllMocks();
});

describe("defineTsdownConfig", () => {
  test("passes the resolved config to the callbacks and merges native configs last", async () => {
    mockCwd(root);

    const callback = vi.fn(async (config: ConfigContext) => {
      return {
        bundle: [(await config.get("packageJson")).name],
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
            exclude: [...(await config.get("tests")).dirs],
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
