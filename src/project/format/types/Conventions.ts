/**
 * The project's formatting conventions, which each formatter adapter maps onto
 * its tool's options.
 */
export interface Conventions {
  indent: "spaces" | "tabs";
  indentWidth: number;
  lineWidth: number;
  quotes: "double" | "single";
  semicolons: boolean;
  trailingCommas: "all" | "es5" | "none";
  endOfLine: "lf" | "crlf";
}
