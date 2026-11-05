import { ESLint } from "eslint";
import { afterEach, describe, expect, test, vi } from "vitest";

import { map } from "@auaust/primitive-kit/arrays";

import { getFixture } from "#tests/utils/getFixture";
import { mockCwd } from "#tests/utils/mockCwd";
import { defineEslintConfig } from "#tools/eslint/definers/defineEslintConfig";
import type { ConfigContext } from "#project/config/types/ConfigContext";

const root = getFixture("eslint");

afterEach(() => {
  vi.restoreAllMocks();
});

describe("defineEslintConfig", () => {
  test("passes the resolved config to the callbacks and appends native configs", async () => {
    mockCwd(root);

    const callback = vi.fn(async (config: ConfigContext) => {
      return {
        stylistic: (await config.get("root")) === root,
      };
    });

    const eslint = new ESLint({
      cwd: root,
      overrideConfigFile: true,
      overrideConfig: await defineEslintConfig(callback, async (config) => {
        return {
          files: map((await config.get("src")).dirs, (directory) => {
            return `${directory}/restricted.ts`;
          }),
          rules: {
            "auaust/no-array-is-array": "off",
          },
        };
      }),
    });

    const [result] = await eslint.lintFiles(["src/restricted.ts"]);

    expect(callback).toHaveBeenCalledOnce();

    expect(map(result?.messages ?? [], (message) => message.ruleId)).toEqual([
      "auaust/no-runtime-typeof",
      "auaust/no-typeof-undefined",
    ]);
  });
});
