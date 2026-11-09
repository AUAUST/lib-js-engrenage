import { freeze } from "@auaust/toolkit/object";

import { lockfileIgnores } from "#tools/git/constants";
import type { Options } from "#tools/prettier/types/Options";
import type { GlobGroup } from "#types/GlobGroup";
import type { Globs } from "#types/Globs";

export const fixedOptions = freeze({
  arrowParens: "always",
  bracketSameLine: true,
  bracketSpacing: true,
  checkIgnorePragma: true,
  embeddedLanguageFormatting: "auto",
  htmlWhitespaceSensitivity: "css",
  insertPragma: false,
  jsxSingleQuote: false,
  objectWrap: "preserve",
  proseWrap: "preserve",
  quoteProps: "preserve",
  requirePragma: false,
  singleAttributePerLine: false,
  vueIndentScriptAndStyle: false,
} as const satisfies Options);

export const codegenTitle = "Codegen";

export const defaultIgnores = freeze([
  lockfileIgnores,
] as const) satisfies readonly GlobGroup[];

export const prettierDefaultIgnores = freeze([
  ".git",
  ".jj",
  ".sl",
  ".svn",
  ".hg",
  "node_modules",
] as const) satisfies Globs;

export { prettier } from "#constants";
