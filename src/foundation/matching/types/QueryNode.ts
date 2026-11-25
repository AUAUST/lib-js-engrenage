import type { QueryLeaf } from "#foundation/matching/types/QueryLeaf";

export type QueryNode =
  | QueryLeaf
  | { readonly kind: "all"; readonly children: readonly QueryNode[] }
  | {
      readonly kind: "any";
      readonly children: readonly QueryNode[];
      readonly min: number;
    }
  | { readonly kind: "not"; readonly child: QueryNode };
