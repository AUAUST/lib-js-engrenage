import { ESLint } from "eslint";
import { afterEach, describe, expect, test, vi } from "vitest";

import { defineEslintConfig } from "@auaust/engrenage/eslint";
import { map } from "@auaust/primitive-kit/arrays";
import type { ResolvedConfig } from "@auaust/engrenage/config";

import { getFixture } from "#tests/helpers/getFixture";
import { mockCwd } from "#tests/helpers/mockCwd";

const root = getFixture("eslint");

afterEach(() => {
  vi.restoreAllMocks();
});

describe("defineEslintConfig", () => {
  test("passes the resolved config to the callbacks and appends native configs", async () => {
    mockCwd(root);

    const callback = vi.fn((config: ResolvedConfig) => {
      return {
        stylistic: config.root === root,
      };
    });

    const eslint = new ESLint({
      cwd: root,
      overrideConfigFile: true,
      overrideConfig: await defineEslintConfig(callback, (config) => {
        return {
          files: map(config.source.dirs, (directory) => {
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
    ]);
  });
});
