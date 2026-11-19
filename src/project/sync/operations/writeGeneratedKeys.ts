import { diamond } from "@auaust/toolkit";
import { sort } from "@auaust/toolkit/array";
import { entries, record } from "@auaust/toolkit/object";

import { parseJson } from "#foundation/json/index";
import { validate } from "#foundation/options/index";
import { syncRecordSchema } from "#project/sync/config/schemas/syncRecordSchema";
import type { LoadedConfig } from "#project/config/index";

/**
 * Records `keys` as those the target producing `part` generated, keeping
 * the other parts.
 */
export async function writeGeneratedKeys(
  config: LoadedConfig,
  part: string,
  keys: readonly string[],
): Promise<void> {
  const filesystem = config.context.filesystem;

  const resources = await config.resolve("resources");

  const path = resources.path("state.sync");

  const content = await filesystem.read(path);

  const current = content === undefined
    ? {}
    : validate(syncRecordSchema, parseJson(content, path), path);

  const parts = sort(
    entries({ ...current, [part]: sort([...keys], diamond) }),
    ([a], [b]) => diamond(a, b),
  );

  await filesystem.write(
    path,
    `${JSON.stringify(record(parts), undefined, 2)}\n`,
  );
}
