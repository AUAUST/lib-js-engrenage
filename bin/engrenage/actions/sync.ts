import {
  listBlockingDiagnostics,
  renderStructureDiagnostic,
} from "#project/structure/index";
import {
  listSyncOptions,
  readSyncFlags,
  runSync,
  settleChanges,
} from "#project/sync/index";
import { getRunContext } from "#workflows/cli/index";
import { loadValidatedConfig } from "#workflows/config/index";

export default async function (
  targets: readonly string[],
  {
    check,
    values,
  }: { check: boolean; values: Readonly<Record<string, unknown>> },
): Promise<void> {
  const { reporter } = getRunContext();

  const config = await loadValidatedConfig(undefined, { reporter });

  const blocking = listBlockingDiagnostics(await config.resolve("structure"));

  if (blocking.length > 0) {
    for (const diagnostic of blocking) {
      reporter.error(renderStructureDiagnostic(diagnostic));
    }

    process.exitCode = 1;

    return;
  }

  const { options } = await listSyncOptions(config);

  if (check) {
    reporter.info("Checking synced files...");
  }

  const failures = await runSync(config, {
    ...(targets.length > 0 && { names: targets }),
    flags: readSyncFlags(options, values),
  });

  await settleChanges(config, {
    check,
    failures,
  });
}
