import { flat, flatMap, map } from "@auaust/primitive-kit/arrays";

import { formatChanges } from "#project/sync/operations/formatChanges";
import type { LoadedConfig } from "#project/config/index";
import type { SyncResult } from "#types/SyncResult";
import type { SyncResults } from "#types/SyncResults";

export async function collectChanges(
  config: LoadedConfig,
  { check }: { check: boolean },
): Promise<SyncResults> {
  const filesystems = await formatChanges(config);

  if (!check) {
    return flat(
      await Promise.all(filesystems.map((filesystem) => filesystem.flush())),
    );
  }

  return map(
    flatMap(filesystems, (filesystem) => filesystem.discard()),
    ({ file }): SyncResult => {
      return {
        file,
        status: "outdated",
      };
    },
  );
}
