import {
  parseTree,
  printParseErrorCode,
  type Node,
  type ParseError,
} from "jsonc-parser";

import type { File } from "#types/File";

export function parseJsonObject(content: string, path: File): Node {
  const errors: ParseError[] = [];

  const tree = parseTree(content, errors, {
    allowTrailingComma: true,
  });

  const [error] = errors;

  if (error !== undefined) {
    throw new Error(
      `Invalid JSON in ${path}: ${printParseErrorCode(error.error)} at offset ${error.offset}`,
    );
  }

  if (tree?.type !== "object") {
    throw new Error(`${path} must contain a JSON object`);
  }

  return tree;
}
