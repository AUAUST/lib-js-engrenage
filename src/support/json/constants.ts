import { freeze } from "@auaust/toolkit/object";

import { defaultOptions } from "#prettier/constants";

export const emptyObjectFile = "{}\n";

export const formattingOptions = freeze({
  insertSpaces: !defaultOptions.useTabs,
  tabSize: defaultOptions.tabWidth,
} as const);
