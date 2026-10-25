import type { Rules } from "@auaust/engrenage/eslint";
import type { Linter } from "eslint";
import { describe, expectTypeOf, test } from "vitest";

declare module "@auaust/engrenage/eslint" {
  interface Rules {
    "local/strict-rule"?: Linter.RuleEntry<["always" | "never"]>;
  }
}

describe("Rules", () => {
  test("types the options of each configured source", () => {
    expectTypeOf<{
      curly: ["error", "all"];
      "@typescript-eslint/consistent-type-imports": [
        "error",
        {
          fixStyle: "inline-type-imports";
        },
      ];
      "import-x/no-duplicates": [
        "error",
        {
          "prefer-inline": true;
        },
      ];
      "@stylistic/semi": ["error", "always"];
    }>().toExtend<Rules>();

    expectTypeOf<{
      curly: ["error", "sometimes"];
    }>().not.toExtend<Rules>();

    expectTypeOf<{
      "import-x/no-duplicates": [
        "error",
        {
          preferInline: true;
        },
      ];
    }>().not.toExtend<Rules>();
  });

  test("merges local augmentations", () => {
    expectTypeOf<{
      "local/strict-rule": ["error", "always"];
    }>().toExtend<Rules>();

    expectTypeOf<{
      "local/strict-rule": ["error", "sometimes"];
    }>().not.toExtend<Rules>();
  });
});
