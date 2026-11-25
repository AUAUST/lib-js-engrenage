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

// @barrel utils
export { hasBraceExpansion } from "#foundation/shell/utils/hasBraceExpansion";
export { hasTilde } from "#foundation/shell/utils/hasTilde";
export { isNode } from "#foundation/shell/utils/isNode";
export { isRebound } from "#foundation/shell/utils/isRebound";
export { quoteShellWord } from "#foundation/shell/utils/quoteShellWord";
export { readColumn } from "#foundation/shell/utils/readColumn";
export { readDialectError } from "#foundation/shell/utils/readDialectError";
export { readLiteral } from "#foundation/shell/utils/readLiteral";
export { readParseError } from "#foundation/shell/utils/readParseError";
export { readPlainParameter } from "#foundation/shell/utils/readPlainParameter";
export { unescapeAnsiC } from "#foundation/shell/utils/unescapeAnsiC";
export { unescapeShell } from "#foundation/shell/utils/unescapeShell";
// @end
