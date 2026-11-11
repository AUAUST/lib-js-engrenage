import { settleChanges } from "#project/sync/index";
import { createDraft } from "#tools/github/index";
import { loadValidatedConfig } from "#workflows/config/index";

export default async function (
  type: string,
  options: {
    slug?: string | undefined;
    repo?: string | undefined;
    parent?: string | undefined;
    after?: string | undefined;
  },
): Promise<void> {
  const config = await loadValidatedConfig(process.cwd());

  await createDraft(config, type, options);

  await settleChanges(config, { check: false });
}
