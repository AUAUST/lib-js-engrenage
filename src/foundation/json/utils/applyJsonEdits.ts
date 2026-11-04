import { isDeepStrictEqual } from "node:util";

import { parseJsonObject } from "#foundation/json/utils/parseJsonObject";
import { readJsonValue } from "#foundation/json/utils/readJsonValue";
import { writeJsonValue } from "#foundation/json/utils/writeJsonValue";
import type { JsonEdit } from "#foundation/json/types/JsonEdit";
import type { File } from "#types/File";

export function applyJsonEdits(
  content: string,
  path: File,
  edits: readonly JsonEdit[],
): string {
  parseJsonObject(content, path);

  let synced = content;

  for (const { path: location, value } of edits) {
    if (!isDeepStrictEqual(readJsonValue(synced, path, location), value)) {
      synced = writeJsonValue(synced, path, location, value);
    }
  }

  return synced;
}
