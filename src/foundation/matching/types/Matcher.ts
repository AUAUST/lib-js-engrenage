import type { PreparedText } from "#foundation/matching/types/PreparedText";
import type { QueryLeaf } from "#foundation/matching/types/QueryLeaf";

export type Matcher = (leaf: QueryLeaf, field: PreparedText) => number;
