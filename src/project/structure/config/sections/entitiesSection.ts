import { record } from "@auaust/toolkit/object";

import { createEntityIndex, type EntityIndex } from "#batiment/structure/index";
import { declareSection } from "#foundation/options/index";
import { readEnvironments } from "#project/environments/index";
import { resolveTestPatterns } from "#project/structure/operations/resolveTestPatterns";
import type { ConfigResolver } from "#project/config/index";
import type { Directory } from "#types/Directory";

async function readOutDir(
  config: ConfigResolver,
): Promise<Directory | undefined> {
  try {
    return await config.resolve("build.outDir");
  } catch {
    // @debt an unreadable tsconfig hides the output directory, so the index skips it instead of failing; the output directory should resolve without parsing the tsconfig
  }
}

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
    ] = await Promise.all([
      config.resolve("structure"),
      readEnvironments(config),
      resolveTestPatterns(config),
      config.resolve("environmentRoles"),
      config.resolve("scopes"),
      config.resolve("aliases"),
      config.resolve("packageJson"),
      readOutDir(config),
    ]);

    return createEntityIndex({
      root: config.context.root,
      structure,
      environments: record(
        environments.map(({ entry, environment }) => {
          return [entry.name, environment];
        }),
      ),
      roles,
      testPatterns,
      scopes,
      outDir,
      aliases,
      packageName: packageJson.optional.name,
    });
  },
});
