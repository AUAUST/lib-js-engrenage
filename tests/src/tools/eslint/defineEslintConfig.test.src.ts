import { ESLint } from "eslint";
import { afterEach, describe, expect, test, vi } from "vitest";

import { map } from "@auaust/primitive-kit/arrays";

import { getFixture } from "#tests/utils/getFixture";
import { mockCwd } from "#tests/utils/mockCwd";
import { defineEslintConfig } from "#tools/eslint/config/defineEslintConfig";
import type { LoadedConfig } from "#project/config/types/LoadedConfig";

const root = getFixture("eslint");

afterEach(() => {
  vi.restoreAllMocks();
});

describe("defineEslintConfig", () => {
  test("passes the resolved config to the callbacks and appends native configs", async () => {
    mockCwd(root);

    const callback = vi.fn((config: LoadedConfig) => {
      return {
        stylistic: config.context.root === root,
        structure: { domainContent: false },
      };
    });

    const eslint = new ESLint({
      cwd: root,
      overrideConfigFile: true,
      overrideConfig: await defineEslintConfig(callback, async (config) => {
        return {
          files: map((await config.resolve("src")).dirs, (directory) => {
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

    const ruleIds = map(result?.messages ?? [], (message) => message.ruleId);

    expect(ruleIds).toEqual(
      expect.arrayContaining([
        "auaust/no-runtime-typeof",
        "auaust/no-typeof-undefined",
      ]),
    );

    expect(ruleIds).toHaveLength(2);
  });
});
