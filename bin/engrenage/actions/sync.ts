import { loadValidatedConfig } from "#workflows/config/index";
import {
  listSyncOptions,
  readSyncFlags,
  runSync,
  settleChanges,
} from "#workflows/sync/index";

export default async function (
  targets: readonly string[],
  {
    check,
    values,
  }: { check: boolean; values: Readonly<Record<string, unknown>> },
): Promise<void> {
  const config = await loadValidatedConfig();

  const { options } = await listSyncOptions(config);

  if (check) {
    console.info("Checking synced files...");
  }

  await runSync(config, {
    ...(targets.length > 0 && { names: targets }),
    flags: readSyncFlags(options, values),
  });

  await settleChanges(config, {
    check,
  });
}
