import { freeze } from "@auaust/toolkit/object";

import { conventions } from "#project/format/constants";
import { lockfileIgnores as gitLockfileIgnores } from "#tools/git/constants";
import type { Options } from "#tools/prettier/types/Options";
import type { GlobGroup } from "#types/GlobGroup";

export const defaultOptions = freeze({
  arrowParens: "always",
  bracketSameLine: true,
  bracketSpacing: true,
  checkIgnorePragma: true,
  embeddedLanguageFormatting: "auto",
  endOfLine: conventions.endOfLine,
  htmlWhitespaceSensitivity: "css",
  insertPragma: false,
  jsxSingleQuote: false,
  objectWrap: "preserve",
  printWidth: conventions.lineWidth,
  proseWrap: "preserve",
  quoteProps: "preserve",
  requirePragma: false,
  semi: conventions.semicolons,
  singleAttributePerLine: false,
  singleQuote: conventions.quotes === "single",
  tabWidth: conventions.indentWidth,
  trailingComma: conventions.trailingCommas,
  useTabs: conventions.indent === "tabs",
  vueIndentScriptAndStyle: false,
} as const satisfies Options);

export const lockfileIgnores = freeze({
  ...gitLockfileIgnores,
  globs: freeze(["pnpm-lock.yaml", ...gitLockfileIgnores.globs]),
} as const) satisfies GlobGroup;

export const eslintIgnores = freeze({
  title: "ESLint",
  globs: freeze(["eslint-suppressions.json"]),
} as const) satisfies GlobGroup;

export const changelogIgnores = freeze({
  title: "Changelog",
  globs: freeze(["CHANGELOG.md"]),
} as const) satisfies GlobGroup;

export const codegenTitle = "Codegen";

export const defaultIgnores = freeze([
  lockfileIgnores,
  eslintIgnores,
] as const) satisfies readonly GlobGroup[];
