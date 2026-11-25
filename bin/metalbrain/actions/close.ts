import { locateRecord } from "#metalbrain/kinds/index";
import { closeRecord, formatRecordRename } from "#metalbrain/records/index";
import { settleChanges } from "#project/sync/index";
import { getRunContext } from "#workflows/cli/index";
import { loadValidatedConfig } from "#workflows/config/index";

export default async function (ids: readonly string[]): Promise<void> {
  const { reporter } = getRunContext();

  const config = await loadValidatedConfig(process.cwd(), { reporter });

  const { filesystem } = config.context;

  const located = await Promise.allSettled(
    [...new Set(ids)].map(async (given) => {
      return { given, ...(await locateRecord(filesystem, given)) };
    }),
  );

  const failures = located
    .filter((result) => result.status === "rejected")
    .map(({ reason }: PromiseRejectedResult) => {
      return reason instanceof Error ? reason.message : String(reason);
    });

  if (failures.length > 0) {
    throw new Error(
      [`No entry was closed:`, ...failures.map((line) => `- ${line}`)].join(
        "\n",
      ),
    );
  }

  for (const result of located) {
    if (result.status !== "fulfilled") {
      continue;
    }

    const { given, kind, found } = result.value;

    await closeRecord(filesystem, kind, found.id);

    const rename = formatRecordRename(given, found.id);

    if (rename !== undefined) {
      reporter.warn(rename);
    }
  }

  await settleChanges(config, { check: false });
}
