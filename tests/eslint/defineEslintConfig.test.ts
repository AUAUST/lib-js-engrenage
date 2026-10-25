import { fileURLToPath } from "node:url";

import { defineEslintConfig } from "@auaust/engrenage/eslint";
import { map } from "@auaust/primitive-kit/arrays";
import { ESLint } from "eslint";
import { afterEach, describe, expect, test, vi } from "vitest";
import type { ResolvedConfig } from "@auaust/engrenage/config";

const root = fileURLToPath(new URL("../fixtures/eslint/", import.meta.url));

afterEach(() => {
  vi.restoreAllMocks();
});

describe("defineEslintConfig", () => {
  test("passes the resolved config to the callback and appends native configs", async () => {
    vi.spyOn(process, "cwd").mockReturnValue(root);

    const callback = vi.fn((config: ResolvedConfig) => {
      return {
        stylistic: config.root === root,
      };
    });

    const eslint = new ESLint({
      cwd: root,
      overrideConfigFile: true,
      overrideConfig: await defineEslintConfig(callback, {
        files: ["src/restricted.ts"],
        rules: {
          "auaust/no-array-is-array": "off",
        },
      }),
    });

    const [result] = await eslint.lintFiles(["src/restricted.ts"]);

    expect(callback).toHaveBeenCalledOnce();
    expect(map(result?.messages ?? [], (message) => message.ruleId)).toEqual([
      "auaust/no-runtime-typeof",
    ]);
  });
});
