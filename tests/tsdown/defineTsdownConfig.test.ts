import { fileURLToPath } from "node:url";

import { defineTsdownConfig } from "@auaust/engrenage/tsdown";
import { afterEach, describe, expect, test, vi } from "vitest";
import type { ResolvedConfig } from "@auaust/engrenage/config";

const root = fileURLToPath(new URL("../fixtures/tsdown/", import.meta.url));

afterEach(() => {
  vi.restoreAllMocks();
});

describe("defineTsdownConfig", () => {
  test("passes the resolved config to the callback and merges native configs last", async () => {
    vi.spyOn(process, "cwd").mockReturnValue(root);

    const callback = vi.fn((config: ResolvedConfig) => {
      return {
        bundle: [config.package.name ?? ""],
      };
    });

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
