import type { SyntaxRestriction } from "#eslint/types/SyntaxRestriction";

export type EslintConventions = {
  root: URL;
  sourceDirectories: string[];
  testDirectories?: string[];
  defaultExportFiles?: string[];
  ignores?: string[];
  syntaxRestrictions?: SyntaxRestriction[];
};
