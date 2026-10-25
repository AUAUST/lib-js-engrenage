import type { Config } from "#prettier/types/Config";
import { freeze } from "@auaust/toolkit/object";

export const printWidth = 80;

export const tabWidth = 2;

export const useTabs = false;

export const semi = true;

export const singleQuote = false;

export const jsxSingleQuote = false;

export const quoteProps = "as-needed";

export const trailingComma = "all";

export const bracketSpacing = true;

export const bracketSameLine = false;

export const objectWrap = "preserve";

export const arrowParens = "always";

export const proseWrap = "preserve";

export const endOfLine = "lf";

export const embeddedLanguageFormatting = "auto";

export const defaultOptions = freeze({
  printWidth,
  tabWidth,
  useTabs,
  semi,
  singleQuote,
  jsxSingleQuote,
  quoteProps,
  trailingComma,
  bracketSpacing,
  bracketSameLine,
  objectWrap,
  arrowParens,
  proseWrap,
  endOfLine,
  embeddedLanguageFormatting,
} satisfies Config);
