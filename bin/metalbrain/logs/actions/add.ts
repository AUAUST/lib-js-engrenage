import { isArray, isString } from "@auaust/toolkit";

import { findLogKind } from "#metalbrain/logs/index";
import { addRecord, type RecordKind } from "#metalbrain/records/index";
import { settleChanges } from "#project/sync/index";
import { getRunContext } from "#workflows/cli/index";
import { loadValidatedConfig } from "#workflows/config/index";

export default async function (
  name: string,
  options: Readonly<Record<string, unknown>>,
): Promise<void> {
  const { reporter } = getRunContext();

  const logKind = findLogKind(name);

  const kind: RecordKind = logKind;

  const values = Object.fromEntries(
    Object.keys(kind.fields).flatMap((key) => {
      const value = options[key];

      return isString(value) || (isArray(value) && value.every(isString))
        ? [[key, value]]
        : [];
    }),
  );

  const config = await loadValidatedConfig(process.cwd(), { reporter });

  const agents = await config.resolve("agents");

  const id = await addRecord(
    config.context.filesystem,
    kind,
    kind.name,
    values,
    { wordCap: agents.wordCaps[logKind.wordCap] },
  );

  await settleChanges(config, { check: false });

  reporter.log(id);
}
