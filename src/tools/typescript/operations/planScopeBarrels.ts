import { listScopeConfigs } from "#project/workspaces/index";
import { planBarrels } from "#tools/typescript/operations/planBarrels";
import type { ConfigResolver } from "#project/config/index";
import type { BarrelPlan } from "#tools/typescript/types/BarrelPlan";

/**
 * The barrels of every scope, each planned from its scope's walk.
 */
export async function planScopeBarrels(
  config: ConfigResolver,
): Promise<readonly BarrelPlan[]> {
  const configs = await listScopeConfigs(config);

  const plans = await Promise.all(
    configs.map(async (scoped) => {
      return planBarrels(
        config.context.filesystem,
        await scoped.resolve("structure"),
      );
    }),
  );

  return plans.flat();
}
