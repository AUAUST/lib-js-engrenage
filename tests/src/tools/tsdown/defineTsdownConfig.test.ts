import { afterEach, describe, expect, test, vi } from "vitest";

import { defineTsdownConfig } from "@auaust/engrenage/tsdown";
import type { ProjectConfig } from "@auaust/engrenage/config";

import { getFixture } from "#tests/utils/getFixture";
import { mockCwd } from "#tests/utils/mockCwd";

const root = getFixture("tsdown");

afterEach(() => {
  vi.restoreAllMocks();
});

describe("defineTsdownConfig", () => {
  test("passes the resolved config to the callbacks and merges native configs last", async () => {
    mockCwd(root);

    const callback = vi.fn((config: ProjectConfig) => {
      return {
        bundle: [config.packageJson.name],
      };
    });

    const tsdownConfig = await defineTsdownConfig(
      callback,
      {
        platform: "neutral",
      },
      (config) => {
        return {
          exports: {
            exclude: [...config.tests.dirs],
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
