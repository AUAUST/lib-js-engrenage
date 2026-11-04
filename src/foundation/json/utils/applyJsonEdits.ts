import { isDeepStrictEqual } from "node:util";

import { parseJsonObject } from "#json/utils/parseJsonObject";
import { readJsonValue } from "#json/utils/readJsonValue";
import { writeJsonValue } from "#json/utils/writeJsonValue";
import type { JsonEdit } from "#json/types/JsonEdit";
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
