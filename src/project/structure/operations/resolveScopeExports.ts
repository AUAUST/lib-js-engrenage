import { extname, posix } from "node:path";

import {
  entries,
  freeze,
  getOwn,
  record,
  values,
} from "@auaust/toolkit/object";

import { entryRoleName, indexRoleName } from "#batiment/roles/constants";
import { rootScope } from "#batiment/scopes/constants";
import {
  getAliasSpecifier,
  type Alias,
  type NamespaceStructure,
  type StructureNode,
} from "#batiment/structure/index";
import { withExtensions, type Filesystem } from "#foundation/filesystem/index";
import { readAliasedLanguage } from "#project/structure/operations/readAliasedLanguage";
import type { Scope } from "#batiment/scopes/index";
import type { ConfigResolver } from "#project/config/index";
import type { Directory } from "#types/Directory";
import type { File } from "#types/File";

const aliasPrefix = "#";

function isPublicRole(
  role: string | undefined,
  { roles }: NamespaceStructure,
): boolean {
  return (
    role === indexRoleName ||
    role === entryRoleName ||
    (role !== undefined && getOwn(roles, role)?.contract.public === true)
  );
}

function isExportedRole(
  role: string,
  node: StructureNode,
  structure: NamespaceStructure,
): boolean {
  if (
    node === structure.root &&
    (role === indexRoleName || role === entryRoleName)
  ) {
    return false;
  }

  return isPublicRole(role, structure);
}

async function listPublicModules(
  node: StructureNode,
  structure: NamespaceStructure,
  filesystem: Filesystem,
  extensions: readonly string[],
): Promise<File[]> {
  const own = entries(node.roleFiles ?? {}).flatMap(([role, files]) => {
    return isExportedRole(role, node, structure) ? files : [];
  });

  const contained = node.kind === "role" && isPublicRole(node.role, structure)
    ? await filesystem.glob(withExtensions(`${node.path}/*`, extensions))
    : [];

  const nested = await Promise.all(
    node.children.map((child) => {
      return listPublicModules(child, structure, filesystem, extensions);
    }),
  );

  return [...own, ...contained, ...nested.flat()];
}

// @debt matches a module against the alias table through the language's first extension, as each alias targets that extension alone, so a `.tsx` module takes the `.ts` alias's subpath
function toSubpath(
  aliases: readonly Alias[],
  scope: Scope,
  file: File,
  extension: string,
): string {
  const relative = posix.relative(scope.dir, file);

  const specifier = getAliasSpecifier(
    aliases,
    `${relative.slice(0, -extname(relative).length)}${extension}`,
  );

  if (specifier?.startsWith(aliasPrefix) !== true) {
    throw new Error(
      `${file} is a public module of ${scope.dir}, which a workspace imports by package name, but no \`#…\` alias of ${scope.dir} targets it, so it has no subpath to export`,
    );
  }

  return `./${specifier.slice(aliasPrefix.length)}`;
}

/**
 * The `exports` map of each unpublished scope a workspace declares as a
 * dependency, by scope directory: each public module of its top-level
 * namespaces whose kind is not sealed, at the subpath mirroring its `#…`
 * alias, but a namespace's root `index` and `entry` files, which only its
 * `executable` may import.
 */
export async function resolveScopeExports(
  config: ConfigResolver,
): Promise<ReadonlyMap<Directory, Readonly<Record<string, string>>>> {
  const [
    groups,
    traits,
    tree,
    scopeAliases,
    context,
    language,
  ] = await Promise.all([
    config.resolve("workspaces"),
    config.resolve("traits"),
    config.resolve("scopes"),
    config.resolve("aliases.scopes"),
    config.resolve("structure.context"),
    readAliasedLanguage(config),
  ]);

  const { filesystem } = config.context;
  const [extension = ""] = language.extensions;

  const imported = new Set(
    groups.flatMap(({ workspaces }) => {
      return workspaces.flatMap(({ dependencies }) => dependencies);
    }),
  );

  const scopes = values(tree.scopes).filter(({ dir }) => {
    return imported.has(dir) && !(dir === rootScope && traits.published);
  });

  const resolved = await Promise.all(
    scopes.map(async (scope) => {
      const structure = scope.dir === rootScope
        ? await config.resolve("structure")
        : await context.walk(scope.dir);

      const tables = getOwn(scopeAliases, scope.key);

      const aliases = tables === undefined
        ? []
        : [...tables.global, ...tables.src];

      const modules = await Promise.all(
        scope.namespaces
          .filter(({ kind }) => (kind.inward ?? "sealed") !== "sealed")
          .map(({ name }) => {
            const walked = getOwn(structure, name);

            return walked === undefined
              ? []
              : listPublicModules(
                  walked.root,
                  walked,
                  filesystem,
                  language.extensions,
                );
          }),
      );

      const exports = modules
        .flat()
        .map((file) => {
          return [
            toSubpath(aliases, scope, file, extension),
            `./${posix.relative(scope.dir, file)}`,
          ] as const;
        })
        .toSorted(([first], [second]) => first.localeCompare(second));

      return [scope.dir, freeze(record(exports))] as const;
    }),
  );

  return new Map(resolved);
}
