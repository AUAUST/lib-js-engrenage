import { findLogKind } from "#metalbrain/logs/index";
import { closeRecord } from "#metalbrain/records/index";
import { settleChanges } from "#project/sync/index";
import { getRunContext } from "#workflows/cli/index";
import { loadValidatedConfig } from "#workflows/config/index";

export default async function (name: string, id: string): Promise<void> {
  const kind = findLogKind(name);

  const config = await loadValidatedConfig(process.cwd(), {
    reporter: getRunContext().reporter,
  });

  await closeRecord(config.context.filesystem, kind, id);

  await settleChanges(config, { check: false });
}
