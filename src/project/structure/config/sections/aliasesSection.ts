import { declareSection } from "#foundation/options/index";
import { aliasesSchema, type LanguageEntry } from "#project/environments/index";
import { resolveAliases } from "#project/structure/operations/resolveAliases";
import type { ConfigResolver } from "#project/config/index";
import type { ResolvedAliases } from "#project/structure/types/ResolvedAliases";
import type { Directory } from "#types/Directory";

const aliasedLanguage = "typescript";

async function readOutDir(
  config: ConfigResolver,
): Promise<Directory | undefined> {
  try {
    return await config.resolve("build.outDir");
  } catch {
    // @debt an unreadable tsconfig hides the output directory, so its alias is generated instead of skipped; the output directory should resolve without parsing the tsconfig
  }
}

// @debt aliases target the language named typescript, so a project without that language, or written in another one, gets no alias
async function readAliasedLanguage(
  config: ConfigResolver,
): Promise<LanguageEntry> {
  const contributions = await config.context.registry.contributions(
    "languages",
    config,
  );

  const language = contributions.find(({ entry }) => {
    return entry.name === aliasedLanguage;
  });

  if (language === undefined) {
    throw new Error(
      `Aliases target the ${aliasedLanguage} language, which no active extension contributes`,
    );
  }

  return language.entry;
}

export const aliasesSection = declareSection({
  declaration: aliasesSchema,
  async resolve(input, config: ConfigResolver): Promise<ResolvedAliases> {
    const option = await config.resolve("src.options");

    const global = aliasesSchema.resolve(input, undefined, "aliases");

    // @debt the environments are read by their built-in names, so a contributed environment's directories get no alias
    const [source, tests, bin, scripts, tooling, data, traits, trees] =
      await Promise.all([
        config.resolve("src"),
        config.resolve("tests"),
        config.resolve("bin"),
        config.resolve("scripts"),
        config.resolve("tooling"),
        config.resolve("data"),
        config.resolve("traits"),
        config.resolve("structure"),
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
      language: await readAliasedLanguage(config),
    });
  },
});
