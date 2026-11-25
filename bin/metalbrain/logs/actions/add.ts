import { listMergeHints } from "#metalbrain/kinds/index";
import { findLogKind } from "#metalbrain/logs/index";
import {
  addRecord,
  pickRecordValues,
  type RecordKind,
} from "#metalbrain/records/index";
import { settleChanges } from "#project/sync/index";
import { getRunContext, runInvocations } from "#workflows/cli/index";
import { loadValidatedConfig } from "#workflows/config/index";

export default async function (
  invocations: readonly [
    name: string,
    options: Readonly<Record<string, unknown>>,
  ][],
): Promise<void> {
  const { reporter } = getRunContext();

  const config = await loadValidatedConfig(process.cwd(), { reporter });

  const { filesystem } = config.context;

  const agents = await config.resolve("agents");

  const added = await runInvocations(invocations, async (name, options) => {
    const logKind = findLogKind(name);

    const kind: RecordKind = logKind;

    const id = await addRecord(
      filesystem,
      kind,
      kind.name,
      pickRecordValues(kind, options),
      { wordCap: agents.wordCaps[logKind.wordCap] },
    );

    return { kind, id };
  });

  await settleChanges(config, { check: false });

  for (const { kind, id } of added) {
    reporter.log(id);

    const hints = await listMergeHints(filesystem, kind, id);

    for (const line of hints) {
      reporter.log(line);
    }
  }
}
