import { map } from "@auaust/primitive-kit/arrays";

import { successMessage } from "#cli/constants";
import { reportSyncResults } from "#cli/utils/reportSyncResults";
import type { ResolvedConfig } from "#config/types/ResolvedConfig";
import type { SyncResult } from "#types/SyncResult";

export async function settleChanges(
  { filesystem }: ResolvedConfig,
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
