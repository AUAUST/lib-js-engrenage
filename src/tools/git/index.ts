// @barrel utils/*.ts named

// @end

// @barrel setup/*.ts named
export { createGitignoreStep } from "#tools/git/setup/createGitignoreStep";
export { syncGitignoreFile } from "#tools/git/setup/syncGitignoreFile";
// @end

// @barrel operations/*.ts named
export { createProjectIgnores } from "#tools/git/operations/createProjectIgnores";
export { findRepositoryRoot } from "#tools/git/operations/findRepositoryRoot";
export { gitSection } from "#tools/git/operations/gitSection";
// @end

// @barrel config/schemas/*.ts named
export { gitSchema } from "#tools/git/config/schemas/gitSchema";
// @end

// @barrel types/*.ts all
export * from "#tools/git/types/GitInput";
export * from "#tools/git/types/ResolvedGit";
// @end
