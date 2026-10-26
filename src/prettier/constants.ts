import { freeze } from "@auaust/toolkit/object";

import { lockfileIgnores as gitLockfileIgnores } from "#git/constants";
import type { Options } from "#prettier/types/Options";
import type { GlobGroup } from "#types/GlobGroup";
import type { PackageName } from "#types/PackageName";

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
  quoteProps: "consistent",
  requirePragma: false,
  semi: true,
  singleAttributePerLine: false,
  singleQuote: false,
  tabWidth: 2,
  trailingComma: "all",
  useTabs: false,
  vueIndentScriptAndStyle: false,
} satisfies Options);

export const lockfileIgnores: GlobGroup = freeze({
  ...gitLockfileIgnores,
  globs: freeze(["pnpm-lock.yaml", ...gitLockfileIgnores.globs]),
});

export const eslintIgnores: GlobGroup = freeze({
  title: "ESLint",
  globs: freeze(["eslint-suppressions.json"]),
});

export const changelogIgnores: GlobGroup = freeze({
  title: "Changelog",
  globs: freeze(["CHANGELOG.md"]),
});

export const changesetsPackage: PackageName = "@changesets/cli";

export const codegenTitle = "Codegen";

export const defaultIgnores: ReadonlyArray<GlobGroup> = freeze([
  lockfileIgnores,
  eslintIgnores,
]);
