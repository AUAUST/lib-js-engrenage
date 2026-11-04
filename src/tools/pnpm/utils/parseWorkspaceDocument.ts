import { isMap, parseDocument } from "yaml";

import { workspaceFile } from "#tools/pnpm/constants";

export function parseWorkspaceDocument(content: string) {
  const document = parseDocument(content);

  if (document.errors.length > 0) {
    throw new Error(`Cannot read ${workspaceFile}`, {
      cause: document.errors[0],
    });
  }

  if (document.contents !== null && !isMap(document.contents)) {
    throw new Error(`${workspaceFile} must contain a YAML mapping`);
  }

  return document;
}
