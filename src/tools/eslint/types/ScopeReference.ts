/**
 * Named set of project files a convention applies to: `files.<environment>` for an
 * environment's globs, `dir.<environment>` for every file under its directories.
 * Naming an environment no active extension contributes throws.
 */
export type ScopeReference =
  | "files.code"
  | "files.discovered"
  | "files.generated"
  | "files.test"
  | "files.test.public"
  | "files.test.src"
  | "files.workspaces"
  | "files.code.published"
  | "files.code.private"
  | "dir.published"
  | "dir.private"
  | `files.${string}`
  | `dir.${string}`;
