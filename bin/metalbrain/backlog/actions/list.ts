import { backlog } from "#metalbrain/backlog/constants";
import { formatRecordTree } from "#metalbrain/kinds/index";
import { listRecords } from "#metalbrain/records/index";
import { getRunContext } from "#nexus/cli/index";
import { loadValidatedConfig } from "#workflows/config/index";

export default async function (category: string | undefined): Promise<void> {
  const { reporter } = getRunContext();

  const config = await loadValidatedConfig(process.cwd(), { reporter });

  const entries = await listRecords(
    config.context.filesystem,
    backlog,
    category,
  );

  const records = entries.map((entry) => {
    return { ...entry, kind: backlog };
  });

  reporter.log(formatRecordTree(records));
}
