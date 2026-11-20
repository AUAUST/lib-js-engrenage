// @debt should provide a way to generate re-exports for subdomains
export {
  createGithubClient,
  fetchGithubSnapshot,
  findRegisteredRepository,
  isMissingResource,
  readGithubSnapshot,
  readOriginRepository,
  resolveCurrentRepository,
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
  resolveIssueCheckouts,
  resolveLocalCheckout,
  type ContractNames,
  type GithubWrite,
  type IssueAudience,
  type LinkedCheckout,
} from "#tools/github/issues/contract/index";
export { issueDraftsDirectory } from "#tools/github/issues/drafts/constants";
export {
  checkDraftFile,
  checkIssues,
  checkIssueViews,
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
export { fetchLabelDiff } from "#tools/github/operations/fetchLabelDiff";
export { locateWorkflowFiles } from "#tools/github/operations/locateWorkflowFiles";
export { pruneLabels } from "#tools/github/operations/pruneLabels";
export { refreshGithubSnapshot } from "#tools/github/operations/refreshGithubSnapshot";
export { renderWorkflow } from "#tools/github/operations/renderWorkflow";
export { renderWorkflowSet } from "#tools/github/operations/renderWorkflowSet";
export { syncLabels } from "#tools/github/operations/syncLabels";
// @end

// @barrel utils
export { diffLabels } from "#tools/github/utils/diffLabels";
export { parseManifestRepository } from "#tools/github/utils/parseManifestRepository";
export { parseRepository } from "#tools/github/utils/parseRepository";
export { resolveWorkflowSet } from "#tools/github/utils/resolveWorkflowSet";
// @end

// @barrel config/schemas
export { contractNamesSchema } from "#tools/github/config/schemas/contractNamesSchema";
export { githubSchema } from "#tools/github/config/schemas/githubSchema";
// @end

// @barrel types
export type * from "#tools/github/types/GithubInput";
export type * from "#tools/github/types/Label";
export type * from "#tools/github/types/LabelDiff";
export type * from "#tools/github/types/LabelUpdate";
export type * from "#tools/github/types/NamedLabel";
export type * from "#tools/github/types/ResolvedGithub";
export type * from "#tools/github/types/WorkflowSet";
export type * from "#tools/github/types/WorkflowSetName";
// @end
