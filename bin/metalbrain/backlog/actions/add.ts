import { settleChanges } from "#project/sync/index";
import { addBacklogEntry } from "#tools/agents/index";
import { getRunContext } from "#workflows/cli/index";
import { loadValidatedConfig } from "#workflows/config/index";

export default async function (
  category: string,
  title: string,
  options: {
    sites?: string[] | undefined;
    why?: string[] | undefined;
    want?: string[] | undefined;
    done?: string[] | undefined;
  },
): Promise<void> {
  const { reporter } = getRunContext();

  const config = await loadValidatedConfig(process.cwd(), { reporter });

  const agents = await config.resolve("agents");

  const id = await addBacklogEntry(
    config.context.filesystem,
    category,
    {
      title,
      ...options,
    },
    {
      day: new Date(),
      budget: agents.budgets.backlogEntry,
    },
  );

  await settleChanges(config, { check: false });

  reporter.log(id);
}
