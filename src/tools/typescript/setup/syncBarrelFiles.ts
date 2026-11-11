import { flatMap } from "@auaust/primitive-kit/arrays";
import { values } from "@auaust/toolkit/object";

import { filesIn } from "#foundation/filesystem/index";
import { barrelHeader } from "#tools/typescript/constants";
import { planBarrels } from "#tools/typescript/operations/planBarrels";
import { renderBarrel } from "#tools/typescript/operations/renderBarrel";
import { listSubpathImports } from "#tools/typescript/utils/listSubpathImports";
import type { LoadedConfig } from "#project/config/index";
import type { SubpathImports } from "#project/package/index";
import type { BarrelExport } from "#tools/typescript/types/BarrelExport";
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

async function listBarrelCandidates(config: LoadedConfig): Promise<File[]> {
  const structure = await config.resolve("structure");

  const globs = flatMap(values(structure), (environment) => {
    if (environment === undefined) {
      return [];
    }

    const { dirs, indexFile, entryFile } = environment;

    return filesIn(dirs, [
      `**/${indexFile}`,
      ...(entryFile === undefined ? [] : [`**/${entryFile}`]),
    ]);
  });

  return [
    ...(await config.context.filesystem.glob(globs, {
      exclude: ["**/node_modules"],
    })),
  ];
}

// @debt the target runs in contribution order within the `generate` stage, so a domain another generator creates after it gets its barrels only on the next sync
// @debt a flat domain with a hand-written entry spreads names the target cannot read, so their collisions surface only in TypeScript
export async function syncBarrelFiles(config: LoadedConfig) {
  const { filesystem, registry } = config.context;

  const [plans, imports, contributions] = await Promise.all([
    planBarrels(config),
    resolveSubpathImports(config),
    registry.contributions("barrels.exports", config),
  ]);

  const resolvers = await Promise.all(
    contributions.map(async ({ entry }) => {
      return { name: entry.name, resolve: await entry.load() };
    }),
  );

  const rendered = new Map<File, readonly BarrelExport[]>();

  for (const plan of plans) {
    const { content, exports } = await renderBarrel({
      plan,
      config,
      imports,
      resolvers,
      spreads: rendered,
    });

    rendered.set(plan.file, exports);

    await filesystem.write(plan.file, content);
  }

  for (const file of await listBarrelCandidates(config)) {
    if (rendered.has(file)) {
      continue;
    }

    const content = await filesystem.read(file);

    if (content?.startsWith(barrelHeader) === true) {
      await filesystem.remove(file);
    }
  }
}
