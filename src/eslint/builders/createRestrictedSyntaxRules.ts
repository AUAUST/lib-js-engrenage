import { codeFilesSchema } from "#config/config/schemas/codeFilesSchema";
import { testDirectoriesSchema } from "#config/config/schemas/testDirectoriesSchema";
import { testFilesSchema } from "#config/config/schemas/testFilesSchema";
import { restrictProperties } from "#eslint/builders/restrictProperties";
import { restrictSyntax } from "#eslint/builders/restrictSyntax";
import { misplacedTestRestriction } from "#eslint/config/defaults/misplacedTestRestriction";
import { restrictedProperties } from "#eslint/config/defaults/restrictedProperties";
import { sourceSyntaxRestrictions } from "#eslint/config/defaults/sourceSyntaxRestrictions";
import { syntaxRestrictions } from "#eslint/config/defaults/syntaxRestrictions";
import type { Config } from "#eslint/types/Config";
import type { SyntaxRestriction } from "#eslint/types/SyntaxRestriction";
import { filesIn } from "#eslint/utils/filesIn";
import type { Directory } from "#types/Directory";
import { map } from "@auaust/primitive-kit/arrays";
import { defineConfig } from "eslint/config";
import { getDefault } from "valibot";

export function createRestrictedSyntaxRules({
  sourceDirectories,
  testDirectories = getDefault(testDirectoriesSchema),
  syntaxRestrictions: projectRestrictions = [],
}: {
  sourceDirectories: Directory[];
  testDirectories?: readonly Directory[];
  syntaxRestrictions?: SyntaxRestriction[];
}): Config[] {
  return defineConfig([
    {
      files: [getDefault(codeFilesSchema)],
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
    {
      files: [getDefault(testFilesSchema)],
      ignores: map(testDirectories, filesIn),
      rules: restrictSyntax(
        ...syntaxRestrictions,
        ...projectRestrictions,
        misplacedTestRestriction,
      ),
    },
  ]);
}
