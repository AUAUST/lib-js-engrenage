import { formatRecordTree } from "#metalbrain/kinds/index";
import { findLogKind } from "#metalbrain/logs/index";
import { listRecords } from "#metalbrain/records/index";
import { getRunContext } from "#workflows/cli/index";
import { loadValidatedConfig } from "#workflows/config/index";

export default async function (name: string): Promise<void> {
  const { reporter } = getRunContext();

  const kind = findLogKind(name);

  const config = await loadValidatedConfig(process.cwd(), { reporter });

  const entries = await listRecords(config.context.filesystem, kind);

  const records = entries.map((entry) => {
    return { ...entry, kind };
  });

  for (const line of formatRecordTree(records)) {
    reporter.log(line);
  }
}
