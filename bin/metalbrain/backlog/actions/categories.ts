import { backlog } from "#metalbrain/backlog/constants";
import { readRecordIndex } from "#metalbrain/records/index";
import { getRunContext } from "#workflows/cli/index";
import { loadValidatedConfig } from "#workflows/config/index";

export default async function (): Promise<void> {
  const { reporter } = getRunContext();

  const config = await loadValidatedConfig(process.cwd(), { reporter });

  const index = await readRecordIndex(config.context.filesystem, backlog);

  for (const [name, { purpose, entries }] of Object.entries(index)) {
    reporter.log(
      `${name} (${entries.length})${purpose === undefined ? "" : `: ${purpose}`}`,
    );
  }
}
