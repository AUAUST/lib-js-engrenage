import { findLogKind } from "#metalbrain/logs/index";
import {
  formatRecordRename,
  pickRecordValues,
  updateRecord,
  type RecordKind,
} from "#metalbrain/records/index";
import { settleChanges } from "#project/sync/index";
import { getRunContext, runInvocations } from "#workflows/cli/index";
import { loadValidatedConfig } from "#workflows/config/index";

export default async function (
  invocations: readonly [
    name: string,
    given: string,
    options: Readonly<Record<string, unknown>>,
  ][],
): Promise<void> {
  const { reporter } = getRunContext();

  const config = await loadValidatedConfig(process.cwd(), { reporter });

  const { wordCaps } = await config.resolve("agents");

  const renames = await runInvocations(
    invocations,
    async (name, given, options) => {
      const logKind = findLogKind(name);

      const kind: RecordKind = logKind;

      const id = await updateRecord(
        config.context.filesystem,
        kind,
        given,
        { values: pickRecordValues(kind, options), unset: [] },
        { wordCap: wordCaps[logKind.wordCap] },
      );

      return formatRecordRename(given, id);
    },
  );

  for (const rename of renames) {
    if (rename !== undefined) {
      reporter.warn(rename);
    }
  }

  await settleChanges(config, { check: false });
}
