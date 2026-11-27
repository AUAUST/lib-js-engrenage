import type { SourceCode } from "eslint";

export type SyntaxNode = Parameters<SourceCode["getAncestors"]>[0];
