import type { TSESTree } from "@typescript-eslint/types";

import type { LayoutEdit } from "#tools/prettier/types/LayoutEdit";

export type LayoutConvention = (
  program: TSESTree.Program,
  text: string,
) => readonly LayoutEdit[];
