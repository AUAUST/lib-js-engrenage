import type { readBacklogCategories } from "#tools/agents/operations/readBacklogCategories";

/**
 * A backlog category file: the error parsing it, or its schema issues, its
 * purpose and its entries, each valid or holding its issues.
 */
export type BacklogCategoryFile = Awaited<
  ReturnType<typeof readBacklogCategories>
>[number];
