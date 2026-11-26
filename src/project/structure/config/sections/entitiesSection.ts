import { record } from "@auaust/toolkit/object";

import { createEntityIndex, type EntityIndex } from "#batiment/structure/index";
import { declareSection } from "#foundation/options/index";
import {
  readEnvironments,
  readSelectedLanguages,
} from "#project/environments/index";
import { readOutDir } from "#project/structure/operations/readOutDir";
import { resolveTestPatterns } from "#project/structure/operations/resolveTestPatterns";
import { listModuleExtensions } from "#project/structure/utils/listModuleExtensions";
import type { ConfigResolver } from "#project/config/index";

export const entitiesSection = declareSection({
  async resolve(_input, config: ConfigResolver): Promise<EntityIndex> {
    const [
      structure,
      environments,
      testPatterns,
      roles,
      scopes,
      aliases,
      packageJson,
      outDir,
      context,
      languages,
    ] = await Promise.all([
      config.resolve("structure"),
      readEnvironments(config),
      resolveTestPatterns(config),
      config.resolve("environmentRoles"),
      config.resolve("scopes"),
      config.resolve("aliases"),
      config.resolve("packageJson"),
      readOutDir(config),
      config.resolve("structure.context"),
      readSelectedLanguages(config),
    ]);

    const discovery = await context.discover();

    return createEntityIndex({
      root: config.context.root,
      structure,
      namespacePlacements: record(
        environments.map(({ entry, environment }) => {
          return [entry.name, environment];
        }),
      ),
      environments: discovery.environments.placements,
      roles,
      testPatterns,
      scopes,
      outDir,
      aliases,
      extensions: listModuleExtensions(languages),
      packageName: packageJson.optional.name,
    });
  },
});
