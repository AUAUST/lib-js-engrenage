import { getRunContext } from "#nexus/cli/index";
import { listSyncOptions } from "#project/sync/index";
import { loadValidatedConfig } from "#workflows/config/index";

// @debt lists the sync targets apart from the options loader and the action, each running `listSyncOptions` over the cached config again
export default async function (): Promise<readonly string[]> {
  const { targets } = await listSyncOptions(
    await loadValidatedConfig(undefined, {
      reporter: getRunContext().reporter,
    }),
  );

  return targets;
}
