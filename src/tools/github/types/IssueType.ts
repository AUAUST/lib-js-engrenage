import type { issueTypes } from "#tools/github/constants";

export type IssueType = (typeof issueTypes)[number];
