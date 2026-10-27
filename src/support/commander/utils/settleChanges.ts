import { map } from "@auaust/primitive-kit/arrays";

import { successMessage } from "#support/commander/constants";
import { reportSyncResults } from "#support/commander/utils/reportSyncResults";
import type { ResolvedConfig } from "#config/types/ResolvedConfig";
import type { SyncResult } from "#types/SyncResult";

export function settleChanges(
  { filesystem }: ResolvedConfig,
  { check }: { check: boolean },
) {
  if (!check) {
    reportSyncResults(filesystem.flush());

    return;
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
