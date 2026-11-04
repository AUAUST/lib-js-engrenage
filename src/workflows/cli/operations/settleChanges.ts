import { map } from "@auaust/primitive-kit/arrays";

import { successMessage } from "#workflows/cli/constants";
import { reportSyncResults } from "#workflows/cli/operations/reportSyncResults";
import type { ProjectConfig } from "#project/config/types/ProjectConfig";
import type { SyncResult } from "#types/SyncResult";

export async function settleChanges(
  { filesystem }: ProjectConfig,
  { check }: { check: boolean },
) {
  await filesystem.format();

  if (!check) {
    return void reportSyncResults(filesystem.flush());
  }

  const outdated = map(filesystem.discard(), ({ file }): SyncResult => {
    return {
      file,
      status: "outdated",
    };
  });

  reportSyncResults(outdated);

  if (outdated.length === 0) {
    console.info(successMessage);
  }
}
