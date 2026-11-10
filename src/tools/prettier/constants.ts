import { array, function_, looseObject, optional, string } from "valibot";
import type { StandardSchemaV1 } from "@standard-schema/spec";

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

// @debt typed as StandardSchemaV1 to pass auaust/readonly-constants, erasing the validator's output type
export const prettierPluginEntry: StandardSchemaV1 = looseObject({
  name: string(),
  files: optional(array(string())),
  options: optional(looseObject({})),
  load: function_(),
});

export { prettier } from "#constants";
