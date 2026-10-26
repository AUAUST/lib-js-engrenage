import {
  defineTsdownConfig,
  type ConfigContext,
  type InlineConfig,
} from "@auaust/engrenage/tsdown";
import { afterEach, describe, expect, test, vi } from "vitest";
import type { ResolvedConfig } from "@auaust/engrenage/config";

import { getFixture } from "#tests/helpers/getFixture";
import { mockCwd } from "#tests/helpers/mockCwd";

const root = getFixture("tsdown");

afterEach(() => {
  vi.restoreAllMocks();
});

describe("defineTsdownConfig", () => {
  test("passes the resolved config to the callback and merges native configs last", async () => {
    mockCwd(root);

    const callback = vi.fn(
      (
        _inlineConfig: InlineConfig,
        _context: ConfigContext,
        config: ResolvedConfig,
      ) => {
        return {
          bundle: [config.packageJson.name],
        };
      },
    );

    const tsdownConfig = await defineTsdownConfig(callback, {
      platform: "neutral",
      exports: {
        exclude: ["internal"],
      },
    })(
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
        exclude: ["internal"],
      },
      deps: {
        onlyBundle: ["@fixture/tsdown"],
      },
      minify: false,
    });
  });
});
