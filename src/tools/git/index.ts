// @barrel utils
export { hasSeparatedIssueReferences } from "#tools/git/utils/hasSeparatedIssueReferences";
export { readCommitSubject } from "#tools/git/utils/readCommitSubject";
// @end

// @barrel setup
export { createGitattributesStep } from "#tools/git/setup/createGitattributesStep";
export { createGitignoreStep } from "#tools/git/setup/createGitignoreStep";
// @end

// @barrel config/sections
export { gitSection } from "#tools/git/config/sections/gitSection";
// @end

// @barrel operations
export { createGitignorePresets } from "#tools/git/operations/createGitignorePresets";
export { fillAttributesBlock } from "#tools/git/operations/fillAttributesBlock";
export { fillIgnoreBlock } from "#tools/git/operations/fillIgnoreBlock";
export { findHookBypass } from "#tools/git/operations/findHookBypass";
export { findRepositoryRoot } from "#tools/git/operations/findRepositoryRoot";
export { hashTree } from "#tools/git/operations/hashTree";
export { listChangedFiles } from "#tools/git/operations/listChangedFiles";
export { listExcludeFiles } from "#tools/git/operations/listExcludeFiles";
export { listIgnoredGlobs } from "#tools/git/operations/listIgnoredGlobs";
export { listIgnoreFiles } from "#tools/git/operations/listIgnoreFiles";
export { listIssueCommits } from "#tools/git/operations/listIssueCommits";
export { listLocalFiles } from "#tools/git/operations/listLocalFiles";
export { listPartiallyStagedFiles } from "#tools/git/operations/listPartiallyStagedFiles";
export { locateIgnoreFiles } from "#tools/git/operations/locateIgnoreFiles";
export { readCommit } from "#tools/git/operations/readCommit";
export { readHead } from "#tools/git/operations/readHead";
export { readIgnorePatterns } from "#tools/git/operations/readIgnorePatterns";
export { resolveMainWorktree } from "#tools/git/operations/resolveMainWorktree";
export { runGit } from "#tools/git/operations/runGit";
// @end

// @barrel config/schemas
export { gitSchema } from "#tools/git/config/schemas/gitSchema";
// @end

// @barrel ports
export type * from "#tools/git/ports/IgnoreFileEntry";
// @end

// @barrel types
export type * from "#tools/git/types/ChangeMode";
export type * from "#tools/git/types/GitInput";
export type * from "#tools/git/types/IssueCommit";
export type * from "#tools/git/types/ResolvedGit";
// @end
