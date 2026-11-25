import { backlog } from "#metalbrain/backlog/constants";
import { formatRecordLine } from "#metalbrain/kinds/index";
import { listRecords } from "#metalbrain/records/index";
import { getRunContext } from "#workflows/cli/index";
import { loadValidatedConfig } from "#workflows/config/index";

export default async function (category: string | undefined): Promise<void> {
  const { reporter } = getRunContext();

  const config = await loadValidatedConfig(process.cwd(), { reporter });

  const entries = await listRecords(
    config.context.filesystem,
    backlog,
    category,
  );

  for (const entry of entries) {
    reporter.log(formatRecordLine(backlog, entry));
  }
}
