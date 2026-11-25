import { extname, posix } from "node:path";

import { toDeduplicated } from "@auaust/toolkit/array";
import {
  entries,
  freeze,
  getOwn,
  record,
  values,
} from "@auaust/toolkit/object";

import {
  getFileEnvironment,
  type EnvironmentPlacements,
  type RegisteredEnvironment,
} from "#batiment/environments/index";
import { entryRoleName, indexRoleName } from "#batiment/roles/constants";
import { rootScope } from "#batiment/scopes/constants";
import {
  getAliasSpecifier,
  inheritPublicRoles,
  isPublicRole,
  type Alias,
  type NamespaceStructure,
  type StructureNode,
} from "#batiment/structure/index";
import { withExtensions, type Filesystem } from "#foundation/filesystem/index";
import {
  readEnvironmentLanguages,
  type LanguageEntry,
} from "#project/environments/index";
import { readAliasedLanguage } from "#project/structure/operations/readAliasedLanguage";
import type { ResolvedRoleContract } from "#batiment/roles/index";
import type { Scope } from "#batiment/scopes/index";
import type { ConfigResolver } from "#project/config/index";
import type { Directory } from "#types/Directory";
import type { File } from "#types/File";
import type { Glob } from "#types/Glob";

const aliasPrefix = "#";

function contractOf(
  role: string | undefined,
  { roles }: NamespaceStructure,
): ResolvedRoleContract | undefined {
  return role === undefined ? undefined : getOwn(roles, role)?.contract;
}

function isExportedRole(
  role: string,
  node: StructureNode,
  structure: NamespaceStructure,
  publicRoles: readonly string[],
): boolean {
  if (role === indexRoleName || role === entryRoleName) {
    return node !== structure.root;
  }

  return isPublicRole(role, contractOf(role, structure), publicRoles);
}

function listModuleGlobs(
  directory: Directory,
  { nesting, categories }: ResolvedRoleContract,
  extensions: readonly string[],
): Glob[] {
  if (nesting === "any") {
    return [withExtensions(`${directory}/**/*`, extensions)];
  }

  const depth = nesting + (categories === true ? 1 : 0);

  return Array.from({ length: depth + 1 }, (_, level) => {
    return withExtensions(`${directory}/${"*/".repeat(level)}*`, extensions);
  });
}

async function listPublicModules(
  node: StructureNode,
  structure: NamespaceStructure,
  filesystem: Filesystem,
  extensions: readonly string[],
  inherited: readonly string[],
): Promise<File[]> {
  const publicRoles = inheritPublicRoles(inherited, node);

  const own = entries(node.roleFiles ?? {}).flatMap(([role, files]) => {
    return isExportedRole(role, node, structure, publicRoles) ? files : [];
  });

  const contract = contractOf(node.role, structure);

  const contained = (
    extensions.length > 0 &&
    node.kind === "role" &&
    contract !== undefined &&
    isPublicRole(node.role, contract, publicRoles)
  )
    ? await filesystem.glob(listModuleGlobs(node.path, contract, extensions))
    : [];

  const nested = await Promise.all(
    node.children.map((child) => {
      return listPublicModules(
        child,
        structure,
        filesystem,
        extensions,
        publicRoles,
      );
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
 * The extensions `language` takes in each environment registered in `scope`, by
 * environment name, as the environment's language options resolve them.
 */
async function readScopeExtensions(
  config: ConfigResolver,
  scope: Scope,
  registered: readonly RegisteredEnvironment[],
  language: LanguageEntry,
): Promise<ReadonlyMap<string, readonly string[]>> {
  const scoped = await config.context.scope(scope.dir);

  const extensions = await Promise.all(
    registered
      .filter((environment) => environment.scope === scope.dir)
      .map(async ({ registration: { name } }) => {
        const languages = await readEnvironmentLanguages(scoped, name);

        const selected = languages.find(
          (entry) => entry.name === language.name,
        );

        return [name, selected?.extensions ?? []] as const;
      }),
  );

  return new Map(extensions);
}

function isLanguageModule(
  file: File,
  placements: EnvironmentPlacements,
  extensions: ReadonlyMap<string, readonly string[]>,
): boolean {
  const environment = getFileEnvironment(placements, file);

  if (environment === undefined) {
    throw new Error(
      `${file} is a public module a workspace imports by package name, but no environment covers it, so no language options tell whether it is a module to export`,
    );
  }

  return (extensions.get(environment) ?? []).some((extension) => {
    return file.endsWith(extension);
  });
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

  const { environments } = await context.discover();

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

      const extensions = await readScopeExtensions(
        config,
        scope,
        environments.registered,
        language,
      );

      const globbed = toDeduplicated([...extensions.values()].flat());

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
              : listPublicModules(walked.root, walked, filesystem, globbed, []);
          }),
      );

      const exports = modules
        .flat()
        .filter((file) => {
          return isLanguageModule(file, environments.placements, extensions);
        })
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
