import { map } from "@auaust/primitive-kit/arrays";

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
}
