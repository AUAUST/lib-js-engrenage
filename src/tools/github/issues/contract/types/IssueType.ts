import type { issueTypes } from "#tools/github/issues/contract/constants";

export type IssueType = (typeof issueTypes)[number];
