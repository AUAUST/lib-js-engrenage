import type { TSESTree } from "@typescript-eslint/types";

import type { TagDeclaration } from "#project/docs/index";
import type { LayoutEdit } from "#tools/prettier/types/LayoutEdit";

export type LayoutConvention = (
  program: TSESTree.Program,
  text: string,
  options: {
    printWidth: number;
    tabWidth: number;
    tags: readonly TagDeclaration[];
  },
) => readonly LayoutEdit[];
