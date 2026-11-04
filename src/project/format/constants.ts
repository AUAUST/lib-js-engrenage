import { freeze } from "@auaust/toolkit/object";

import type { Conventions } from "#project/format/types/Conventions";

export const conventions: Readonly<Conventions> = freeze({
  indent: "spaces",
  indentWidth: 2,
  lineWidth: 80,
  quotes: "double",
  semicolons: true,
  trailingCommas: "all",
  endOfLine: "lf",
});

// @debt maps conventions onto jsonc-parser input, yet JSON has no tool domain to map at its boundary; thirteen callers import it and pass it on, so JSON files ignore the configurable `format` section
export const jsonIndentation = freeze({
  insertSpaces: conventions.indent === "spaces",
  tabSize: conventions.indentWidth,
} as const);
