import { findNodeAtLocation, getNodeValue, type JSONPath } from "jsonc-parser";

import { parseJsonObject } from "#foundation/json/utils/parseJsonObject";
import type { File } from "#types/File";

export function readJsonValue(
  content: string,
  path: File,
  location: JSONPath,
): unknown {
  const node = findNodeAtLocation(parseJsonObject(content, path), location);

  // jsonc-parser builds objects without a prototype, which deep strict equality never matches against plain objects; cloning rebuilds them as plain objects.
  return node === undefined ? undefined : structuredClone(getNodeValue(node));
}
