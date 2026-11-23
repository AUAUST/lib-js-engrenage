import { freeze } from "@auaust/toolkit/object";

import { environmentMetadataFile } from "#batiment/environments/constants";
import {
  domainMetadataFile,
  namespaceMetadataFile,
  workspaceMetadataFile,
} from "#batiment/scopes/constants";
import { engrenage, eslint, prettier, typescript } from "#constants";
import { eslintFlags } from "#tools/eslint/constants";
import type { Integration } from "#tools/vscode/types/Integration";
import type { File } from "#types/File";

export const extensionsFile = ".vscode/extensions.json" satisfies File;

export const settingsFile = ".vscode/settings.json" satisfies File;

export const metadataSchemas = freeze([
  {
    file: namespaceMetadataFile,
    schema: `${engrenage}/schemas/namespace.schema.json`,
  },
  {
    file: domainMetadataFile,
    schema: `${engrenage}/schemas/domain.schema.json`,
  },
  {
    file: environmentMetadataFile,
    schema: `${engrenage}/schemas/environment.schema.json`,
  },
  {
    file: workspaceMetadataFile,
    schema: `${engrenage}/schemas/workspace.schema.json`,
  },
] as const);

export const eslintIntegration = freeze({
  requires: [eslint],
  settings: {
    "editor.codeActionsOnSave": {
      "source.fixAll.eslint": "explicit",
      "source.organizeImports": "never",
      "source.sortImports": "never",
    },
    "eslint.codeActionsOnSave.mode": "problems",
    "eslint.options": {
      flags: [...eslintFlags],
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
    "js/ts.preferences.importModuleSpecifier": "non-relative",
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
