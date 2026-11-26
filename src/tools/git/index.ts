// @barrel utils
export { canonicalizeCommitReferences } from "#tools/git/utils/canonicalizeCommitReferences";
export { readCommitMessage } from "#tools/git/utils/readCommitMessage";
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
export { hashTrees } from "#tools/git/operations/hashTrees";
export { listChangedFiles } from "#tools/git/operations/listChangedFiles";
export { listExcludeFiles } from "#tools/git/operations/listExcludeFiles";
export { listIgnoredGlobs } from "#tools/git/operations/listIgnoredGlobs";
export { listIgnoreFiles } from "#tools/git/operations/listIgnoreFiles";
export { listIssueCommits } from "#tools/git/operations/listIssueCommits";
export { listLocalFiles } from "#tools/git/operations/listLocalFiles";
export { listNestedIgnoreFiles } from "#tools/git/operations/listNestedIgnoreFiles";
export { listPartiallyStagedFiles } from "#tools/git/operations/listPartiallyStagedFiles";
export { listRemovedFiles } from "#tools/git/operations/listRemovedFiles";
export { listUnstagedFiles } from "#tools/git/operations/listUnstagedFiles";
export { locateIgnoreFiles } from "#tools/git/operations/locateIgnoreFiles";
export { readCommit } from "#tools/git/operations/readCommit";
export { readCommittedFile } from "#tools/git/operations/readCommittedFile";
export { readHead } from "#tools/git/operations/readHead";
export { readIgnorePatterns } from "#tools/git/operations/readIgnorePatterns";
export { readRenamedFiles } from "#tools/git/operations/readRenamedFiles";
export { readStagedChanges } from "#tools/git/operations/readStagedChanges";
export { runGit } from "#tools/git/operations/runGit";
export { withTemporaryIndex } from "#tools/git/operations/withTemporaryIndex";
// @end

// @barrel config/schemas
export { gitSchema } from "#tools/git/config/schemas/gitSchema";
// @end

// @barrel ports
export type * from "#tools/git/ports/IgnoreFileEntry";
// @end

// @barrel types
export type * from "#tools/git/types/ChangeMode";
export type * from "#tools/git/types/CommitMessage";
export type * from "#tools/git/types/GitInput";
export type * from "#tools/git/types/IssueCommit";
export type * from "#tools/git/types/ResolvedGit";
export type * from "#tools/git/types/StagedChanges";
export type * from "#tools/git/types/TreeHashes";
// @end
