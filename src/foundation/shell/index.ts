// @barrel types
export type * from "#foundation/shell/types/ShellAssignment";
export type * from "#foundation/shell/types/ShellCommand";
export type * from "#foundation/shell/types/ShellRedirect";
export type * from "#foundation/shell/types/ShellWord";
// @end

// @barrel errors
export { ShellSyntaxError } from "#foundation/shell/errors/ShellSyntaxError";
// @end

// @barrel operations
export { parseShell } from "#foundation/shell/operations/parseShell";
// @end

export { quoteShellWord } from "#foundation/shell/utils/quoteShellWord";
