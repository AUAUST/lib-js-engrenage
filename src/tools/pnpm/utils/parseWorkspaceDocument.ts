import { isMap, parseDocument } from "yaml";

import { pnpmWorkspaceFile } from "#constants";

export function parseWorkspaceDocument(content: string) {
  const document = parseDocument(content);

  if (document.errors.length > 0) {
    throw new Error(`Cannot read ${pnpmWorkspaceFile}`, {
      cause: document.errors[0],
    });
  }

  if (document.contents !== null && !isMap(document.contents)) {
    throw new Error(`${pnpmWorkspaceFile} must contain a YAML mapping`);
  }

  return document;
}
