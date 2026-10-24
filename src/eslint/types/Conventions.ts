import type { SyntaxRestriction } from "#eslint/types/SyntaxRestriction";
import type { Directory } from "#types/Directory";
import type { Glob } from "#types/Glob";

export interface Conventions {
  root: Directory | URL;
  sourceDirectories: Directory[];
  testDirectories?: Directory[];
  defaultExportFiles?: Glob[];
  ignores?: Glob[];
  syntaxRestrictions?: SyntaxRestriction[];
}
