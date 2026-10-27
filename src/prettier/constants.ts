import { freeze } from "@auaust/toolkit/object";

import { lockfileIgnores as gitLockfileIgnores } from "#git/constants";
import type { Options } from "#prettier/types/Options";
import type { GlobGroup } from "#types/GlobGroup";

export const defaultOptions = freeze({
  arrowParens: "always",
  bracketSameLine: true,
  bracketSpacing: true,
  checkIgnorePragma: true,
  embeddedLanguageFormatting: "auto",
  endOfLine: "lf",
  htmlWhitespaceSensitivity: "css",
  insertPragma: false,
  jsxSingleQuote: false,
  objectWrap: "preserve",
  printWidth: 80,
  proseWrap: "preserve",
  quoteProps: "preserve",
  requirePragma: false,
  semi: true,
  singleAttributePerLine: false,
  singleQuote: false,
  tabWidth: 2,
  trailingComma: "all",
  useTabs: false,
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
] as const) satisfies ReadonlyArray<GlobGroup>;
