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

async function resolveWorkspaceAliases({
  config,
  context,
  scope,
  language,
}: {
  config: ConfigResolver;
  context: LoadedContext;
  scope: Scope;
  language: LanguageEntry;
}): Promise<ResolvedAliases> {
  const entries = scope.namespaces.filter(({ kind }) => kind.entries === true);

  if (entries.length > 1) {
    throw new Error(
      `Workspace ${scope.dir} holds several namespaces of package entries, ${entries
        .map(({ name }) => {
          return name;
        })
        .join(" and ")}, whose source aliases would share one table`,
    );
  }

  const [scoped, structure] = await Promise.all([
    config.context.scope(scope.dir),
    context.walk(scope.dir),
  ]);

  const [switches, { aliases }] = await Promise.all([
    scoped.input("aliases"),
    // @debt the source aliases' options come from `src.options` whatever the name of the workspace's entries namespace
    scoped.resolve("src.options"),
  ]);

  const source = flatMap(entries, ({ name }) => {
    const walked = getOwn(structure, name);

    return walked === undefined ? [] : [{ name, structure: walked }];
  });

  return resolveAliases({
    filesystem: config.context.filesystem,
    scope: scope.dir,
    options: {
      // @debt a workspace's own `aliases.define` is dropped with the root's it inherits
      global: {
        ...aliasesSchema.resolve(switches, undefined, "aliases"),
        define: freeze({}),
      },
      src: aliases,
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
    source: source[0],
    language,
  });
}

export const aliasScopesSection = declareSection({
  declaration: aliasesSchema,
  async resolve(
    _input,
    config: ConfigResolver,
  ): Promise<Readonly<Record<string, ResolvedAliases>>> {
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
              language,
            }),
          ] as const;
        }),
    );

    return freeze(record([[rootScope, root] as const, ...workspaces]));
  },
});
