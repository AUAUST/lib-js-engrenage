import { getOwn, record } from "@auaust/toolkit/object";

import { rootScope } from "#batiment/scopes/constants";
import { declareSection } from "#foundation/options/index";
import {
  aliasesSchema,
  createLanguageExtensions,
  readEnvironments,
} from "#project/environments/index";
import { readAliasedLanguage } from "#project/structure/operations/readAliasedLanguage";
import { readOutDir } from "#project/structure/operations/readOutDir";
import { resolveAliases } from "#project/structure/operations/resolveAliases";
import { isAliasedNamespaceKind } from "#project/structure/utils/isAliasedNamespaceKind";
import type { ResolvedAliases } from "#batiment/structure/index";
import type { ConfigResolver } from "#project/config/index";

export const aliasesSection = declareSection({
  declaration: aliasesSchema,
  async resolve(input, config: ConfigResolver): Promise<ResolvedAliases> {
    const option = await config.resolve("src.options");

    const global = aliasesSchema.resolve(input, undefined, "aliases");

    const [
      environments,
      data,
      traits,
      trees,
      execution,
      language,
    ] = await Promise.all([
      readEnvironments(config),
      config.resolve("data"),
      config.resolve("traits"),
      config.resolve("structure"),
      config.resolve("environments.execution"),
      readAliasedLanguage(config),
    ]);

    return resolveAliases({
      filesystem: config.context.filesystem,
      scope: rootScope,
      options: { global, src: option.aliases },
      bundled: getOwn(execution, "src")?.bundled ?? false,
      namespaces: record(
        environments
          .filter(({ namespace, environment }) => {
            return environment.active && isAliasedNamespaceKind(namespace);
          })
          .map(({ entry, environment }) => [entry.name, environment.dirs]),
      ),
      // @debt the root's `data` alias follows the `data` environment and the `published` trait while a workspace's follows its namespace kind (`aliasScopesSection`), so an unpublished project whose `data` namespace is of kind `shipped` still gets an alias its grants forbid
      data: data.active && !traits.published ? data.dirs : [],
      outDir: await readOutDir(config),
      source: trees.src === undefined
        ? undefined
        : { name: "src", structure: trees.src },
      language,
      extensionsOf: await createLanguageExtensions(config, language.name),
    });
  },
});
