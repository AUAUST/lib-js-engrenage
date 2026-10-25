import {
  createEslintConfig,
  type Config,
  type Conventions,
} from "@auaust/engrenage/eslint";
import { map } from "@auaust/primitive-kit/arrays";
import { ESLint } from "eslint";
import { fileURLToPath } from "node:url";
import { describe, expect, expectTypeOf, test } from "vitest";

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

  test("reports test files outside the test directories", async () => {
    expect(await lintedRules("src/misplaced.test.ts")).toEqual([
      "no-restricted-syntax",
    ]);

    expect(await lintedRules("tests/placed.test.ts")).toEqual([]);
  });

  test("allows default exports in tool configs", async () => {
    expect(await lintedRules("tool.config.ts")).toEqual([]);
  });

  test("exposes its contract through the local aliases", () => {
    expectTypeOf(createEslintConfig).parameter(0).toEqualTypeOf<Conventions>();
    expectTypeOf(createEslintConfig).returns.toEqualTypeOf<Config[]>();
  });
});
