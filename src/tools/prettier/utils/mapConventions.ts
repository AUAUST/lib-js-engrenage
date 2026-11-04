import type { Conventions } from "#project/format/types/Conventions";
import type { Options } from "#tools/prettier/types/Options";

export function mapConventions({
  indent,
  indentWidth,
  lineWidth,
  quotes,
  semicolons,
  trailingCommas,
  endOfLine,
}: Conventions): Options {
  return {
    endOfLine,
    printWidth: lineWidth,
    semi: semicolons,
    singleQuote: quotes === "single",
    tabWidth: indentWidth,
    trailingComma: trailingCommas,
    useTabs: indent === "tabs",
  };
}
