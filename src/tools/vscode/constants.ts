import { freeze } from "@auaust/toolkit/object";

import { eslint, prettier, typescript } from "#constants";
import type { File } from "#types/File";
import type { Integration } from "#vscode/types/Integration";

export const extensionsFile = ".vscode/extensions.json" satisfies File;

export const settingsFile = ".vscode/settings.json" satisfies File;

export const eslintIntegration = freeze({
  requires: [eslint],
  settings: {
    "editor.codeActionsOnSave": {
      "source.fixAll.eslint": "explicit",
      "source.organizeImports": "never",
      "source.sortImports": "never",
    },
  },
  extensions: ["dbaeumer.vscode-eslint"],
} as const) satisfies Integration;

export const prettierIntegration = freeze({
  requires: [prettier],
  settings: {
    "editor.defaultFormatter": "esbenp.prettier-vscode",
    "editor.formatOnSave": true,
    "prettier.requireConfig": true,
  },
  extensions: ["esbenp.prettier-vscode"],
} as const) satisfies Integration;

export const typescriptIntegration = freeze({
  requires: [typescript],
  settings: freeze({
    "js/ts.tsdk.path": "node_modules/typescript/lib",
    "typescript.tsdk": undefined,
  }),
  extensions: [],
} as const) satisfies Integration;

export const integrations = freeze([
  eslintIntegration,
  prettierIntegration,
  typescriptIntegration,
] as const) satisfies readonly Integration[];
