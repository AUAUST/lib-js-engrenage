import { freeze } from "@auaust/toolkit/object";

export const directoryPlaceholder = "{dir}";

export const workspaceTsconfigFile = "tsconfig.json";

export const selfImports = freeze({
  "#self/*": freeze({
    types: freeze(["./src/*.ts", "./src/*.tsx"] as const),
    default: "./src/*",
  } as const),
} as const);

export const workspaceEntryStem = "src/index";
