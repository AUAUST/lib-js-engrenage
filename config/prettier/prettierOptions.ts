import type { Config } from "#prettier/types/Config";

export const prettierOptions = {
  printWidth: 80,
  tabWidth: 2,
  useTabs: false,
  semi: true,
  singleQuote: false,
  jsxSingleQuote: false,
  quoteProps: "as-needed",
  trailingComma: "all",
  bracketSpacing: true,
  bracketSameLine: false,
  objectWrap: "preserve",
  arrowParens: "always",
  proseWrap: "preserve",
  endOfLine: "lf",
  embeddedLanguageFormatting: "auto",
} satisfies Config;
