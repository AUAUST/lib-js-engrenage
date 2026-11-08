import { loadValidatedConfig } from "#workflows/config/index";
import {
  runSync,
  settleChanges,
  type SyncTargetFlags,
  type SyncTargetName,
} from "#workflows/sync/index";

export default async function (
  targets: readonly SyncTargetName[],
  { check, flags }: { check: boolean; flags: SyncTargetFlags },
): Promise<void> {
  const config = await loadValidatedConfig();

  if (check) {
    console.info("Checking synced files...");
  }

  await runSync(config, {
    names: targets,
    flags,
  });

  await settleChanges(config, {
    check,
  });
}
