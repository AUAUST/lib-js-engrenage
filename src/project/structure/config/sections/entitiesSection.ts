import { declareSection } from "#foundation/options/index";
import { createEntityIndex } from "#project/structure/utils/createEntityIndex";
import type { ConfigResolver } from "#project/config/index";
import type { EntityIndex } from "#project/structure/types/EntityIndex";
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
    // @debt the environments are read by their built-in names, so the files of a contributed environment without a structure are never located
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
      config.resolve("structure"),
      config.resolve("src"),
      config.resolve("tests"),
      config.resolve("bin"),
      config.resolve("scripts"),
      config.resolve("tooling"),
      config.resolve("data"),
      config.resolve("environmentRoles"),
      config.resolve("workspaces"),
      config.resolve("aliases"),
      config.resolve("packageJson"),
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
