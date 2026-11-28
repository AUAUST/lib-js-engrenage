import { findLogKind } from "#metalbrain/logs/lookup/index";
import { countRecords } from "#metalbrain/records/index";
import { getRunContext } from "#nexus/cli/index";
import { loadValidatedConfig } from "#workflows/config/index";

export default async function (name: string): Promise<void> {
  const { reporter } = getRunContext();

  const kind = findLogKind(name);

  const config = await loadValidatedConfig(process.cwd(), { reporter });

  const counts = await countRecords(config.context.filesystem, kind);

  for (const { value, count, recurring } of counts) {
    reporter.log(`${count} ${value}${recurring ? " (recurring)" : ""}`);
  }
}
