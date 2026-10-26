import { freeze } from "@auaust/toolkit/object";
import type { FormattingOptions } from "jsonc-parser";

import { defaultOptions } from "#prettier/constants";
import type { File } from "#types/File";
import type { Integration } from "#vscode/types/Integration";

export const extensionsFile: File = ".vscode/extensions.json";

export const settingsFile: File = ".vscode/settings.json";

export const emptyObjectFile = "{}\n";

export const formattingOptions: FormattingOptions = freeze({
  insertSpaces: !defaultOptions.useTabs,
  tabSize: defaultOptions.tabWidth,
});

export const eslintIntegration: Integration = freeze({
  requires: ["eslint"],
  settings: {
    "editor.codeActionsOnSave": {
      "source.fixAll.eslint": "explicit",
      "source.organizeImports": "never",
      "source.sortImports": "never",
    },
  },
  extensions: ["dbaeumer.vscode-eslint"],
});

export const prettierIntegration: Integration = freeze({
  requires: ["prettier"],
  settings: {
    "editor.defaultFormatter": "esbenp.prettier-vscode",
    "editor.formatOnSave": true,
    "prettier.requireConfig": true,
  },
  extensions: ["esbenp.prettier-vscode"],
});

export const typescriptIntegration: Integration = freeze({
  requires: ["typescript"],
  settings: {
    "js/ts.tsdk.path": "node_modules/typescript/lib",
    "typescript.tsdk": undefined,
  },
  extensions: [],
});

export const integrations: ReadonlyArray<Integration> = freeze([
  eslintIntegration,
  prettierIntegration,
  typescriptIntegration,
]);
