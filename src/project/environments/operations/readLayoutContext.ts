import type { LayoutContext } from "#batiment/scopes/index";
import type { ConfigResolver } from "#project/config/index";

/**
 * Reads what an environment's `layout` option resolves against: the names of
 * the contributed layouts.
 */
export async function readLayoutContext(
  config: ConfigResolver,
): Promise<LayoutContext> {
  const layouts = await config.context.registry.contributions(
    "layouts",
    config,
  );

  return { layouts: layouts.map(({ entry }) => entry.name) };
}
