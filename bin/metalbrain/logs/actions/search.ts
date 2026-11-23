import { findLogKind, formatLogEntryLine } from "#metalbrain/logs/index";
import { searchRecords } from "#metalbrain/records/index";
import { getRunContext } from "#workflows/cli/index";
import { loadValidatedConfig } from "#workflows/config/index";

export default async function (name: string, keyword: string): Promise<void> {
  const { reporter } = getRunContext();

  const kind = findLogKind(name);

  const config = await loadValidatedConfig(process.cwd(), { reporter });

  const entries = await searchRecords(config.context.filesystem, kind, keyword);

  for (const entry of entries) {
    reporter.log(formatLogEntryLine(entry));
  }
}
