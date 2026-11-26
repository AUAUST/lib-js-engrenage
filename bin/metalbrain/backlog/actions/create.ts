import { createBacklogCategory } from "#metalbrain/backlog/index";
import { getRunContext } from "#nexus/cli/index";
import { settleChanges } from "#project/sync/index";
import { loadValidatedConfig } from "#workflows/config/index";

export default async function (
  category: string,
  purpose: string,
): Promise<void> {
  const config = await loadValidatedConfig(process.cwd(), {
    reporter: getRunContext().reporter,
  });

  await createBacklogCategory(config.context.filesystem, category, purpose);

  await settleChanges(config, { check: false });
}
