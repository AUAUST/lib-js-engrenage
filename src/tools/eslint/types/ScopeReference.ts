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
