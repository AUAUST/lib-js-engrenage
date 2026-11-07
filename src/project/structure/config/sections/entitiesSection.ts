import { declareSection, type Resolver } from "#foundation/options/index";
import { buildOutDirSection } from "#project/build/index";
import {
  binSection,
  dataSection,
  scriptsSection,
  sourceSection,
  testsSection,
  toolingSection,
} from "#project/environments/index";
import { packageJsonSection } from "#project/package/index";
import { aliasesSection } from "#project/structure/config/sections/aliasesSection";
import { environmentRolesSection } from "#project/structure/config/sections/environmentRolesSection";
import { structureSection } from "#project/structure/config/sections/structureSection";
import { createEntityIndex } from "#project/structure/utils/createEntityIndex";
import { workspacesSection } from "#project/workspaces/index";
import type { ConfigContext } from "#project/config/index";
import type { EntityIndex } from "#project/structure/types/EntityIndex";
import type { Directory } from "#types/Directory";

async function readOutDir(
  config: Resolver<ConfigContext>,
): Promise<Directory | undefined> {
  try {
    return await config.resolve(buildOutDirSection);
  } catch {
    // @debt an unreadable tsconfig hides the output directory, so the index skips it instead of failing; the output directory should resolve without parsing the tsconfig
  }
}

export const entitiesSection = declareSection({
  name: "entities",
  async resolve(_input, config: Resolver<ConfigContext>): Promise<EntityIndex> {
    const [
      structure,
      source,
      tests,
      bin,
      scripts,
      tooling,
      data,
      roles,
      workspaces,
      aliases,
      packageJson,
      outDir,
    ] = await Promise.all([
      config.resolve(structureSection),
      config.resolve(sourceSection),
      config.resolve(testsSection),
      config.resolve(binSection),
      config.resolve(scriptsSection),
      config.resolve(toolingSection),
      config.resolve(dataSection),
      config.resolve(environmentRolesSection),
      config.resolve(workspacesSection),
      config.resolve(aliasesSection),
      config.resolve(packageJsonSection),
      readOutDir(config),
    ]);

    return createEntityIndex({
      root: config.context.root,
      structure,
      environments: {
        src: source,
        tests,
        bin,
        scripts,
        tooling,
        data,
      },
      roles,
      testPatterns: tests.patterns,
      workspaces,
      outDir,
      aliases,
      packageName: packageJson.optional.name,
    });
  },
});
