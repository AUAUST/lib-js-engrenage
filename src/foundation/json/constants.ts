import { freeze } from "@auaust/toolkit/object";

// @debt reaches into tools/prettier, a higher layer than foundation; the layered registry (#143) removes the upward dependency
import { defaultOptions } from "#prettier/constants";

export const emptyObjectFile = "{}\n";

export const formattingOptions = freeze({
  insertSpaces: !defaultOptions.useTabs,
  tabSize: defaultOptions.tabWidth,
} as const);
