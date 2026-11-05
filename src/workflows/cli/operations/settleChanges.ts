import { flat, flatMap, map } from "@auaust/primitive-kit/arrays";

import { successMessage } from "#workflows/cli/constants";
import { listFilesystems } from "#workflows/cli/operations/listFilesystems";
import { reportSyncResults } from "#workflows/cli/operations/reportSyncResults";
import type { LoadedConfig } from "#project/config/index";
import type { SyncResult } from "#types/SyncResult";

export async function settleChanges(
  config: LoadedConfig,
  { check }: { check: boolean },
) {
  const filesystems = await listFilesystems(config);

  await Promise.all(filesystems.map((filesystem) => filesystem.format()));

  if (!check) {
    return void reportSyncResults(
      flat(
        await Promise.all(filesystems.map((filesystem) => filesystem.flush())),
      ),
    );
  }

  const outdated = map(
    flatMap(filesystems, (filesystem) => filesystem.discard()),
    ({ file }): SyncResult => {
      return {
        file,
        status: "outdated",
      };
    },
  );

  reportSyncResults(outdated);

  if (outdated.length === 0) {
    console.info(successMessage);
  }
}
