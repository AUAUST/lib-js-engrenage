import { parseJson } from "#foundation/json/index";
import { validate } from "#foundation/options/index";
import { syncRecordSchema } from "#project/sync/config/schemas/syncRecordSchema";
import type { LoadedConfig } from "#project/config/index";

/**
 * The keys the target producing `part` generated at the last sync; `undefined`
 * before the record holds the part.
 */
export async function readGeneratedKeys(
  config: LoadedConfig,
  part: string,
): Promise<readonly string[] | undefined> {
  const resources = await config.resolve("resources");

  const path = resources.path("state.sync");

  const content = await config.context.filesystem.read(path);

  if (content !== undefined) {
    return validate(syncRecordSchema, parseJson(content, path), path)[part];
  }
}
