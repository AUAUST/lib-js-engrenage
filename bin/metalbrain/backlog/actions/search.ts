import { backlog } from "#metalbrain/backlog/constants";
import { formatBacklogEntryLine } from "#metalbrain/backlog/index";
import { searchRecords } from "#metalbrain/records/index";
import { getRunContext } from "#workflows/cli/index";
import { loadValidatedConfig } from "#workflows/config/index";

export default async function (keyword: string): Promise<void> {
  const { reporter } = getRunContext();

  const config = await loadValidatedConfig(process.cwd(), { reporter });

  const entries = await searchRecords(
    config.context.filesystem,
    backlog,
    keyword,
  );

  for (const entry of entries) {
    reporter.log(formatBacklogEntryLine(entry));
  }
}
