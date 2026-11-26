import { backlog } from "#metalbrain/backlog/constants";
import { relocateRecordSites } from "#metalbrain/records/index";
import { getRunContext } from "#nexus/cli/index";
import { settleChanges } from "#project/sync/index";
import { loadValidatedConfig } from "#workflows/config/index";

export default async function (from: string, to: string): Promise<void> {
  const { reporter } = getRunContext();

  const config = await loadValidatedConfig(process.cwd(), { reporter });

  const agents = await config.resolve("agents");

  const relocations = await relocateRecordSites(
    config.context.filesystem,
    backlog,
    { from, to },
    { wordCap: agents.wordCaps[backlog.wordCap] },
  );

  await settleChanges(config, { check: false });

  for (const { id, site, relocated } of relocations) {
    reporter.log(`${id} ${site} → ${relocated}`);
  }
}
