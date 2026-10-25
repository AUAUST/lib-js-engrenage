import { restrictedProperties } from "#config/eslint/restrictedProperties";
import { sourceSyntaxRestrictions } from "#config/eslint/sourceSyntaxRestrictions";
import { syntaxRestrictions } from "#config/eslint/syntaxRestrictions";
import { typescriptFiles } from "#config/eslint/typescriptFiles";
import { restrictProperties } from "#eslint/builders/restrictProperties";
import { restrictSyntax } from "#eslint/builders/restrictSyntax";
import type { Config } from "#eslint/types/Config";
import type { SyntaxRestriction } from "#eslint/types/SyntaxRestriction";
import { filesIn } from "#eslint/utils/filesIn";
import type { Directory } from "#types/Directory";
import { map } from "@auaust/primitive-kit/arrays";
import { defineConfig } from "eslint/config";

export function createRestrictedSyntaxRules({
  sourceDirectories,
  syntaxRestrictions: projectRestrictions = [],
}: {
  sourceDirectories: Directory[];
  syntaxRestrictions?: SyntaxRestriction[];
}): Config[] {
  return defineConfig([
    {
      files: [typescriptFiles],
      rules: {
        ...restrictProperties(...restrictedProperties),
        ...restrictSyntax(...syntaxRestrictions, ...projectRestrictions),
      },
    },
    {
      files: map(sourceDirectories, filesIn),
      rules: restrictSyntax(
        ...syntaxRestrictions,
        ...sourceSyntaxRestrictions,
        ...projectRestrictions,
      ),
    },
  ]);
}
