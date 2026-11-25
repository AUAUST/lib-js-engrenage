import { formatRecordLine } from "#metalbrain/kinds/index";
import { findLogKind } from "#metalbrain/logs/index";
import { listRecords } from "#metalbrain/records/index";
import { getRunContext } from "#workflows/cli/index";
import { loadValidatedConfig } from "#workflows/config/index";

export default async function (name: string): Promise<void> {
  const { reporter } = getRunContext();

  const kind = findLogKind(name);

  const config = await loadValidatedConfig(process.cwd(), { reporter });

  for (const entry of await listRecords(config.context.filesystem, kind)) {
    reporter.log(formatRecordLine(kind, entry));
  }
}
