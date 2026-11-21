import type { LayoutContext } from "#batiment/environments/index";
import type { ConfigResolver } from "#project/config/index";

/**
 * Reads what an environment's `layout` option resolves against: the names of the
 * contributed layouts and the layout of the environment's kind.
 */
export async function readLayoutContext(
  config: ConfigResolver,
  environment: string,
): Promise<LayoutContext> {
  const { registry } = config.context;

  const [layouts, environments, kinds] = await Promise.all([
    registry.contributions("layouts", config),
    registry.contributions("environments", config),
    registry.contributions("environmentKinds", config),
  ]);

  const kind = environments.find(({ entry }) => entry.name === environment)
    ?.entry.kind;

  return {
    layouts: layouts.map(({ entry }) => entry.name),
    layout: kinds.find(({ entry }) => entry.name === kind)?.entry.layout,
  };
}
