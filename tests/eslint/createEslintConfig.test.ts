import { map } from "@auaust/primitive-kit/arrays";
import { createEslintConfig } from "@auaust/engrenage/eslint";
import { ESLint } from "eslint";
import { fileURLToPath } from "node:url";
import { describe, expect, test } from "vitest";

const root = new URL("../fixtures/eslint/", import.meta.url);

async function lintedRules(file: string) {
  const eslint = new ESLint({
    cwd: fileURLToPath(root),
    overrideConfigFile: true,
    overrideConfig: createEslintConfig({
      root,
      sourceDirectories: ["src"],
    }),
  });

  const [result] = await eslint.lintFiles([file]);

  return map(result?.messages ?? [], (message) => message.ruleId);
}

describe("createEslintConfig", () => {
  test("reports the shared conventions in source files", async () => {
    const rules = await lintedRules("src/violations.ts");

    expect(rules).toEqual(
      expect.arrayContaining(["curly", "import-x/no-default-export"]),
    );
  });

  test("allows default exports in tool configs", async () => {
    expect(await lintedRules("tool.config.ts")).toEqual([]);
  });

  test("rejects a root that is not a directory URL", () => {
    expect(() => {
      return createEslintConfig({
        root: new URL("file:///project"),
        sourceDirectories: ["src"],
      });
    }).toThrow('ending with "/"');
  });
});
