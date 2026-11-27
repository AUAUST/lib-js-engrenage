import { listMergeHints } from "#metalbrain/kinds/index";
import { findLogKind } from "#metalbrain/logs/index";
import {
  addRecord,
  pickRecordValues,
  type RecordKind,
} from "#metalbrain/records/index";
import { getRunContext } from "#nexus/cli/index";
import { settleChanges } from "#project/sync/index";
import { loadValidatedConfig } from "#workflows/config/index";

export default async function (
  name: string,
  options: Readonly<Record<string, unknown>>,
  keywords: readonly string[],
): Promise<void> {
  const { reporter } = getRunContext();

  const config = await loadValidatedConfig(process.cwd(), { reporter });

  const { filesystem } = config.context;

  const agents = await config.resolve("agents");

  const logKind = findLogKind(name);

  const kind: RecordKind = logKind;

  const id = await addRecord(
    filesystem,
    kind,
    kind.name,
    pickRecordValues(kind, options),
    { wordCap: agents.wordCaps[logKind.wordCap] },
  );

  await settleChanges(config, { check: false });

  reporter.log(id);

  const hints = await listMergeHints(filesystem, kind, id, { keywords });

  for (const line of hints) {
    reporter.log(line);
  }
}
