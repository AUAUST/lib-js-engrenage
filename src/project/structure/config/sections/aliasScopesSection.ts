import { flatMap } from "@auaust/toolkit/array";
import { freeze, getOwn, record, values } from "@auaust/toolkit/object";

import { rootScope } from "#batiment/scopes/constants";
import { declareSection } from "#foundation/options/index";
import { dataNamespaceKind } from "#project/environments/constants";
import { aliasesSchema, type LanguageEntry } from "#project/environments/index";
import { readAliasedLanguage } from "#project/structure/operations/readAliasedLanguage";
import { resolveAliases } from "#project/structure/operations/resolveAliases";
import { isAliasedNamespaceKind } from "#project/structure/utils/isAliasedNamespaceKind";
import type { LoadedContext } from "#batiment/context/index";
import type { Scope } from "#batiment/scopes/index";
import type { ResolvedAliases } from "#batiment/structure/index";
import type { ConfigResolver } from "#project/config/index";
import type { AliasesOption } from "#project/structure/types/AliasesOption";

async function resolveWorkspaceAliases({
  config,
  context,
  scope,
  switches,
  language,
}: {
  config: ConfigResolver;
  context: LoadedContext;
  scope: Scope;
  switches: AliasesOption;
  language: LanguageEntry;
}): Promise<ResolvedAliases> {
  const structure = await context.walk(scope.dir);

  const sources = flatMap(scope.namespaces, ({ name, kind }) => {
    const walked = getOwn(structure, name);

    return kind.entries === true && walked !== undefined
      ? [{ name, structure: walked }]
      : [];
  });

  if (sources.length > 1) {
    throw new Error(
      `Workspace ${scope.dir} holds several namespaces of package entries, ${sources
        .map(({ name }) => {
          return name;
        })
        .join(" and ")}, whose source aliases would share one table`,
    );
  }

  // @debt a workspace takes the root's `aliases` switches and its source namespace the schema defaults, until its child resolver reads its own options (#745)
  return resolveAliases({
    filesystem: config.context.filesystem,
    scope: scope.dir,
    options: {
      global: { ...switches, define: freeze({}) },
      src: aliasesSchema.resolve(undefined, undefined, "aliases"),
    },
    bundled: false,
    namespaces: record(
      scope.namespaces
        .filter(({ kind }) => isAliasedNamespaceKind(kind))
        .map(({ name, dirs }) => [name, dirs]),
    ),
    data: flatMap(scope.namespaces, ({ kind, dirs }) => {
      return kind.name === dataNamespaceKind.name ? dirs : [];
    }),
    outDir: undefined,
    source: sources[0],
    language,
  });
}

export const aliasScopesSection = declareSection({
  declaration: aliasesSchema,
  async resolve(
    input,
    config: ConfigResolver,
  ): Promise<Readonly<Record<string, ResolvedAliases>>> {
    const switches = aliasesSchema.resolve(input, undefined, "aliases");

    const [root, context, language] = await Promise.all([
      config.resolve("aliases"),
      config.resolve("structure.context"),
      readAliasedLanguage(config),
    ]);

    const { tree } = await context.discover();

    const workspaces = await Promise.all(
      values(tree.scopes)
        .filter(({ key }) => key !== rootScope)
        .map(async (scope) => {
          return [
            scope.key,
            await resolveWorkspaceAliases({
              config,
              context,
              scope,
              switches,
              language,
            }),
          ] as const;
        }),
    );

    return freeze(record([[rootScope, root] as const, ...workspaces]));
  },
});
