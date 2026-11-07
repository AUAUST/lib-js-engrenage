import { declareSection, type Resolver } from "#foundation/options/index";
import { buildOutDirSection } from "#project/build/index";
import {
  aliasesSchema,
  binSection,
  dataSection,
  scriptsSection,
  sourceOptionsSection,
  sourceSection,
  testsSection,
  toolingSection,
} from "#project/environments/index";
import { traitsSection } from "#project/presets/index";
import { structureSection } from "#project/structure/config/sections/structureSection";
import { resolveAliases } from "#project/structure/operations/resolveAliases";
import type { ConfigContext } from "#project/config/index";
import type { Directory } from "#types/Directory";

async function readOutDir(
  config: Resolver<ConfigContext>,
): Promise<Directory | undefined> {
  try {
    return await config.resolve(buildOutDirSection);
  } catch {
    // @debt an unreadable tsconfig hides the output directory, so its alias is generated instead of skipped; the output directory should resolve without parsing the tsconfig
  }
}

export const aliasesSection = declareSection({
  name: "aliases",
  declaration: aliasesSchema,
  async resolve(input, config: Resolver<ConfigContext>) {
    const option = await config.resolve(sourceOptionsSection);

    const global = aliasesSchema.resolve(input, undefined, "aliases");

    const [source, tests, bin, scripts, tooling, data, traits, trees] =
      await Promise.all([
        config.resolve(sourceSection),
        config.resolve(testsSection),
        config.resolve(binSection),
        config.resolve(scriptsSection),
        config.resolve(toolingSection),
        config.resolve(dataSection),
        config.resolve(traitsSection),
        config.resolve(structureSection),
      ]);

    return resolveAliases({
      root: config.context.root,
      options: { global, src: option.aliases },
      bundled: option.bundled,
      environments: {
        src: source.dirs,
        tests: tests.dirs,
        bin: bin.dirs,
        scripts: scripts.dirs,
        tooling: tooling.dirs,
      },
      data: data.active ? data.dirs : [],
      published: traits.published,
      outDir: await readOutDir(config),
      structure: trees.src,
    });
  },
});
