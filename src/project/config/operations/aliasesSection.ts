import { declareSection, type Resolver } from "#foundation/options/index";
import { binSection } from "#project/config/operations/binSection";
import { buildSection } from "#project/config/operations/buildSection";
import { dataSection } from "#project/config/operations/dataSection";
import { scriptsSection } from "#project/config/operations/scriptsSection";
import { sourceOptionsSection } from "#project/config/operations/sourceOptionsSection";
import { sourceSection } from "#project/config/operations/sourceSection";
import { structureSection } from "#project/config/operations/structureSection";
import { testsSection } from "#project/config/operations/testsSection";
import { toolingSection } from "#project/config/operations/toolingSection";
import { traitsSection } from "#project/config/operations/traitsSection";
import { aliasesSchema, resolveAliases } from "#project/structure/index";
import type { ConfigContext } from "#project/config/types/ConfigContext";
import type { Directory } from "#types/Directory";

async function readOutDir(
  config: Resolver<ConfigContext>,
): Promise<Directory | undefined> {
  try {
    const build = await config.resolve(buildSection);

    return await build.outDir;
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
