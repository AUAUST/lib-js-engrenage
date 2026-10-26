import { findNodeAtLocation, getNodeValue, type JSONPath } from "jsonc-parser";

import { parseJsonObject } from "#support/json/utils/parseJsonObject";
import type { File } from "#types/File";

export function readJsonValue(
  content: string,
  path: File,
  location: JSONPath,
): unknown {
  const node = findNodeAtLocation(parseJsonObject(content, path), location);

  return node === undefined ? undefined : getNodeValue(node);
}
