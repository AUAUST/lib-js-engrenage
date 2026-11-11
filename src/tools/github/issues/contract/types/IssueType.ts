import type { typeMeanings } from "#tools/github/issues/contract/constants";

export type IssueType = keyof typeof typeMeanings;
