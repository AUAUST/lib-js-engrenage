import { formatRecordTree } from "#metalbrain/kinds/index";
import { findLogKind } from "#metalbrain/logs/index";
import { listRecords, pickRecordValues } from "#metalbrain/records/index";
import { getRunContext } from "#nexus/cli/index";
import { loadValidatedConfig } from "#workflows/config/index";

export default async function (
  name: string,
  options: Readonly<Record<string, unknown>>,
): Promise<void> {
  const { reporter } = getRunContext();

  const kind = findLogKind(name);

  const filters = Object.entries(pickRecordValues(kind, options));

  const config = await loadValidatedConfig(process.cwd(), { reporter });

  const entries = await listRecords(config.context.filesystem, kind);

  const records = entries
    .filter(({ entry }) => {
      return filters.every(([key, value]) => entry[key] === value);
    })
    .map((entry) => {
      return { ...entry, kind };
    });

  for (const line of formatRecordTree(records)) {
    reporter.log(line);
  }
}
