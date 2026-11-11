import { renderBarrel } from "#tools/typescript/operations/renderBarrel";
import { listSubpathImports } from "#tools/typescript/utils/listSubpathImports";
import type { LoadedConfig } from "#project/config/index";
import type { SubpathImports } from "#project/package/index";
import type { BarrelExport } from "#tools/typescript/types/BarrelExport";
import type { BarrelPlan } from "#tools/typescript/types/BarrelPlan";
import type { File } from "#types/File";

async function resolveSubpathImports(
  config: LoadedConfig,
): Promise<SubpathImports> {
  const { enabled, global, src } = await config.resolve("aliases");

  if (enabled) {
    return listSubpathImports([...global, ...src]);
  }

  const { imports } = await config.resolve("packageJson");

  return imports;
}

export async function createBarrelRenderer(config: LoadedConfig) {
  const [imports, contributions] = await Promise.all([
    resolveSubpathImports(config),
    config.context.registry.contributions("barrels.exports", config),
  ]);

  const resolvers = await Promise.all(
    contributions.map(async ({ entry }) => {
      return { name: entry.name, resolve: await entry.load() };
    }),
  );

  return function render(
    plan: BarrelPlan,
    spreads: ReadonlyMap<File, readonly BarrelExport[]>,
  ) {
    return renderBarrel({
      plan,
      config,
      imports,
      resolvers,
      spreads,
    });
  };
}
