import { flatMap, map } from "@auaust/primitive-kit/arrays";

import { successMessage } from "#workflows/cli/constants";
import { reportSyncResults } from "#workflows/cli/operations/reportSyncResults";
import { listFilesystems } from "#workflows/cli/utils/listFilesystems";
import type { Filesystem } from "#foundation/filesystem/index";
import type { OptionContext } from "#foundation/options/index";
import type { ResolvedGit } from "#tools/git/index";
import type { SyncResult } from "#types/SyncResult";

export async function settleChanges(
  config: OptionContext<{ filesystem: Filesystem; git: ResolvedGit }>,
  { check }: { check: boolean },
) {
  const filesystems = await listFilesystems(config);

  for (const filesystem of filesystems) {
    await filesystem.format();
  }

  if (!check) {
    return void reportSyncResults(
      flatMap(filesystems, (filesystem) => filesystem.flush()),
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
