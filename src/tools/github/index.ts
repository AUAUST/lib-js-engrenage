// @debt should provide a way to generate re-exports for subdomains
export {
  createGithubClient,
  fetchGithubSnapshot,
  readGithubSnapshot,
  resolveRepository,
  type GithubSnapshot,
} from "#tools/github/issues/api/index";
export {
  checkGithubWrite,
  checkIssue,
  checkIssueTree,
  findBriefedIssue,
  formatIssueCheck,
  formatIssueTreeCheck,
  parseGithubCommand,
  parseIssueBody,
  type GithubWrite,
  type IssueProtocol,
} from "#tools/github/issues/contract/index";
export { issueDraftsDirectory } from "#tools/github/issues/drafts/constants";
export {
  checkIssues,
  claimIssues,
  createDraft,
  publishIssues,
  releaseIssues,
} from "#tools/github/issues/drafts/index";

// @barrel setup
export { createWorkflowsStep } from "#tools/github/setup/createWorkflowsStep";
export { syncWorkflowFiles } from "#tools/github/setup/syncWorkflowFiles";
// @end

// @barrel config/sections
export { githubSection } from "#tools/github/config/sections/githubSection";
// @end

// @barrel operations
export { fillPlanningSheet } from "#tools/github/operations/fillPlanningSheet";
export { generatePlanningSheetRules } from "#tools/github/operations/generatePlanningSheetRules";
export { locateWorkflowFiles } from "#tools/github/operations/locateWorkflowFiles";
export { renderWorkflow } from "#tools/github/operations/renderWorkflow";
export { renderWorkflowSet } from "#tools/github/operations/renderWorkflowSet";
// @end

// @barrel utils
export { resolveWorkflowSet } from "#tools/github/utils/resolveWorkflowSet";
// @end

// @barrel config/schemas
export { githubSchema } from "#tools/github/config/schemas/githubSchema";
export { issueProtocolSchema } from "#tools/github/config/schemas/issueProtocolSchema";
// @end

// @barrel types
export type * from "#tools/github/types/GithubInput";
export type * from "#tools/github/types/ResolvedGithub";
export type * from "#tools/github/types/WorkflowSet";
export type * from "#tools/github/types/WorkflowSetName";
// @end
