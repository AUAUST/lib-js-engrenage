import { map } from "@auaust/primitive-kit/arrays";
import { sourceSyntaxRestrictions } from "#eslint/presets/sourceSyntaxRestrictions";
import { syntaxRestrictions } from "#eslint/presets/syntaxRestrictions";
import { typescriptFiles } from "#eslint/presets/typescriptFiles";
import type { EslintConventions } from "#eslint/types/EslintConventions";
import { filesIn } from "#eslint/utils/filesIn";
import { defineConfig } from "eslint/config";

export function createRestrictedSyntaxRules({
  sourceDirectories,
  syntaxRestrictions: projectRestrictions = [],
}: Pick<EslintConventions, "sourceDirectories" | "syntaxRestrictions">) {
  return defineConfig([
    {
      files: [typescriptFiles],
      rules: {
        "no-restricted-properties": [
          "error",
          {
            object: "Object",
            message: "Use the @auaust/toolkit/object equivalent.",
          },
          {
            object: "Array",
            property: "isArray",
            message: "Use isArray from @auaust/toolkit.",
          },
        ],
        "no-restricted-syntax": [
          "error",
          ...syntaxRestrictions,
          ...projectRestrictions,
        ],
      },
    },
    {
      files: map(sourceDirectories, filesIn),
      rules: {
        "no-restricted-syntax": [
          "error",
          ...sourceSyntaxRestrictions,
          ...projectRestrictions,
        ],
      },
    },
  ]);
}
