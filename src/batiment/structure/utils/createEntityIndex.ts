import { extname, matchesGlob, posix, relative } from "node:path";

import { toSorted } from "@auaust/toolkit/array";
import { memoize } from "@auaust/toolkit/function";
import { entries, freeze, getOwn, values } from "@auaust/toolkit/object";

import {
  getFileEnvironment,
  type EnvironmentPlacements,
} from "#batiment/environments/index";
import {
  entryRoleName,
  indexRoleName,
  noRoles,
} from "#batiment/roles/constants";
import { rootScope } from "#batiment/scopes/constants";
import {
  listNamespaces,
  type ScopeTree,
  type TestVariant,
} from "#batiment/scopes/index";
import { classifyEntityFile } from "#batiment/structure/utils/classifyEntityFile";
import { createStructureEntity } from "#batiment/structure/utils/createStructureEntity";
import { extendEntityLineage } from "#batiment/structure/utils/extendEntityLineage";
import { extendRoleLocation } from "#batiment/structure/utils/extendRoleLocation";
import { getAliasSpecifier } from "#batiment/structure/utils/getAliasSpecifier";
import { inheritPublicRoles } from "#batiment/structure/utils/inheritPublicRoles";
import { isPublicRole } from "#batiment/structure/utils/isPublicRole";
import { listDirectoryLineages } from "#batiment/structure/utils/listDirectoryLineages";
import { listNamedFileRoles } from "#batiment/structure/utils/listNamedFileRoles";
import { resolve, toPosixPath } from "#foundation/filesystem/index";
import type { ResolvedRoles } from "#batiment/roles/index";
import type { EntityIndex } from "#batiment/structure/apis/EntityIndex";
import type { Entity } from "#batiment/structure/types/Entity";
import type { LocatedEntity } from "#batiment/structure/types/LocatedEntity";
import type { NamedFileRole } from "#batiment/structure/types/NamedFileRole";
import type { NamespaceStructure } from "#batiment/structure/types/NamespaceStructure";
import type { ResolvedAliases } from "#batiment/structure/types/ResolvedAliases";
import type { ResolvedStructure } from "#batiment/structure/types/ResolvedStructure";
import type { StructureNode } from "#batiment/structure/types/StructureNode";
import type { Directories } from "#types/Directories";
import type { Directory } from "#types/Directory";
import type { File } from "#types/File";
import type { Globs } from "#types/Globs";

interface CodeNamespace {
  readonly active: boolean;
  readonly dirs: Directories;
}

const projectRoot = ".";
const selfSubpath = ".";
const noNamedFileRoles: readonly NamedFileRole[] = freeze([]);

function sortVariants(
  variants: readonly TestVariant[],
): readonly TestVariant[] {
  return toSorted(variants, (first, second) => {
    return second.marker.length - first.marker.length;
  });
}

export function createEntityIndex({
  root,
  structure,
  namespacePlacements,
  environments,
  roles: namespaceRoles,
  testPatterns,
  scopes,
  outDir,
  aliases,
  packageName,
}: {
  root: Directory;
  structure: ResolvedStructure;
  namespacePlacements: Readonly<Record<string, CodeNamespace>>;
  environments: EnvironmentPlacements;
  roles: Readonly<Partial<Record<string, ResolvedRoles>>>;
  testPatterns: Readonly<Partial<Record<string, Globs>>>;
  scopes: ScopeTree;
  outDir: Directory | undefined;
  aliases: ResolvedAliases;
  packageName: string | undefined;
}): EntityIndex {
  const directories = new Map<Directory, LocatedEntity>();
  // @debt holds the root scope's aliases alone, so `specifierOf` never names the `#…` alias a workspace module is imported by
  const specifiers = [...aliases.src, ...aliases.global];

  const namespaces = listNamespaces(scopes).filter(({ scope }) => {
    return scope === rootScope;
  });

  const publicEntries = new Map(
    namespaces
      .filter(({ kind }) => kind.entries === true)
      .flatMap(({ id }) => entries(structure[id]?.entries ?? {}))
      .map(([subpath, file]) => [file, subpath] as const),
  );

  const variants = new Map(
    namespaces.map(({ id, kind }) => {
      return [id, sortVariants(kind.variants ?? [])] as const;
    }),
  );

  function variantOf(namespace: string | undefined, path: string) {
    if (namespace !== undefined) {
      return variants.get(namespace)?.find(({ name }) => {
        return (getOwn(testPatterns, name) ?? []).some((glob) => {
          return matchesGlob(path, glob);
        });
      })?.name;
    }
  }

  function rolesOf(name: string): ResolvedRoles {
    return getOwn(namespaceRoles, name) ?? noRoles;
  }

  function register(path: Directory, located: LocatedEntity) {
    if (path !== projectRoot && !directories.has(path)) {
      directories.set(path, located);
    }
  }

  function surfaceOf(
    node: StructureNode,
    namespace: NamespaceStructure,
    publicRoles: readonly string[],
  ) {
    const extension = extname(namespace.indexFile);
    const contracts = rolesOf(namespace.name).roles;

    const entry = publicEntries.get(`${node.path}/${namespace.entryFile}`);

    // @debt reads a child role's visibility from the environment's roles, which miss the opt-in roles a namespace enables; `environment.roles` holds every role the walk met
    const roles = node.children
      .filter((child) => {
        return (
          child.kind === "role" &&
          child.role !== undefined &&
          isPublicRole(child.role, contracts[child.role], publicRoles)
        );
      })
      .map((child) => {
        return getAliasSpecifier(specifiers, `${child.path}/*${extension}`);
      });

    const roleFiles = entries(node.roleFiles ?? {}).flatMap(([role, files]) => {
      return isPublicRole(role, contracts[role], publicRoles) ? files : [];
    });

    const barrels = node.children
      .filter((child) => child.kind === "role")
      .map((child) => posix.join(child.path, namespace.indexFile));

    const packaged = [...roleFiles, ...barrels].map((file) => {
      const subpath = publicEntries.get(file);

      return subpath === undefined || packageName === undefined
        ? undefined
        : `${packageName}${subpath.slice(selfSubpath.length)}`;
    });

    return freeze(
      [
        getAliasSpecifier(
          specifiers,
          posix.join(node.path, namespace.indexFile),
        ),
        ...roles,
        ...roleFiles.map((file) => getAliasSpecifier(specifiers, file)),
        ...packaged,
        entry === undefined || packageName === undefined
          ? undefined
          : `${packageName}${entry.slice(selfSubpath.length)}`,
      ].filter((specifier) => specifier !== undefined),
    );
  }

  function visit(
    node: StructureNode,
    parent: Entity,
    namespace: NamespaceStructure,
    directory: Directory,
  ) {
    const role = node.kind === "role" ? node.role : undefined;
    const roles = rolesOf(namespace.name);

    const contract = role === undefined
      ? undefined
      : namespace.roles[role]?.contract;

    const named = freeze(
      listNamedFileRoles(
        contract?.roles ?? [],
        (name) => {
          return namespace.roles[name]?.contract;
        },
        node.fileNames,
      ),
    );

    const publicRoles = inheritPublicRoles(parent.publicRoles, node);

    const entity: Entity = freeze({
      ...parent,
      path: node.path,
      kind: node.kind,
      group: node.group === true,
      lineage: extendEntityLineage(parent.lineage, node, node.path),
      location: extendRoleLocation(parent.location, node),
      domain: node.kind === "domain"
        ? node.path.slice(directory.length + 1)
        : parent.domain,
      surface: node.kind === "domain"
        ? surfaceOf(node, namespace, publicRoles)
        : parent.surface,
      collects: node.kind === "domain"
        ? freeze([...(node.collects ?? [])])
        : parent.collects,
      role,
      contract,
      effects: role === undefined ? undefined : node.effects,
      publicRoles,
      public: isPublicRole(role, contract, publicRoles),
    });

    register(node.path, {
      entity,
      roles,
      named,
      covers: node.kind === "role",
    });

    for (const child of node.children) {
      visit(child, entity, namespace, directory);
    }
  }

  for (const namespace of values(structure)) {
    if (namespace === undefined) {
      continue;
    }

    const { root: tree, name } = namespace;
    const lineages = listDirectoryLineages(namespace);

    for (const { directory, node, lineage } of lineages) {
      const entity: Entity = freeze({
        ...createStructureEntity(name, directory, rootScope),
        kind: node.kind,
        group: tree.group === true,
        lineage,
        location: extendRoleLocation(
          createStructureEntity(name, directory, rootScope).location,
          {
            kind: "namespace",
            name: posix.basename(directory),
            path: directory,
          },
        ),
      });

      register(directory, {
        entity,
        roles: rolesOf(name),
        named: noNamedFileRoles,
        covers: false,
      });

      for (const child of node.children) {
        if (child.path.startsWith(`${directory}/`)) {
          visit(child, entity, namespace, directory);
        }
      }
    }
  }

  for (const [name, { active, dirs }] of entries(namespacePlacements)) {
    if (active) {
      for (const directory of dirs) {
        register(directory, {
          entity: createStructureEntity(name, directory, rootScope),
          roles: rolesOf(name),
          named: noNamedFileRoles,
          covers: true,
        });
      }
    }
  }

  for (const { key, dir } of values(scopes.scopes)) {
    if (key !== rootScope) {
      register(dir, {
        entity: createStructureEntity(undefined, dir, key),
        roles: undefined,
        named: noNamedFileRoles,
        covers: true,
      });
    }
  }

  if (outDir !== undefined) {
    register(outDir, {
      entity: createStructureEntity("dist", outDir, rootScope),
      roles: undefined,
      named: noNamedFileRoles,
      covers: true,
    });
  }

  const nearest = memoize(
    (
      directory: Directory,
    ):
      | { readonly path: Directory; readonly located: LocatedEntity }
      | undefined => {
      for (
        let current = directory, parent = posix.dirname(current);
        current !== parent;
        current = parent, parent = posix.dirname(current)
      ) {
        const located = directories.get(current);

        if (located !== undefined) {
          return { path: current, located };
        }
      }
    },
  );

  function locate(directory: Directory): LocatedEntity | undefined {
    const found = nearest(directory);

    return found !== undefined &&
      (found.path === directory || found.located.covers)
      ? found.located
      : undefined;
  }

  function toProjectPath(file: File): string {
    return toPosixPath(relative(root, resolve(root, file)));
  }

  const describe = memoize((file: File): Entity | undefined => {
    const path = toProjectPath(file);
    const directory = posix.dirname(path);
    const located = locate(directory);

    if (located === undefined) {
      return;
    }

    const { entity } = located;

    const {
      role,
      fileRole,
      contract,
      effects,
    } = classifyEntityFile(posix.basename(path), directory, located);

    return freeze({
      ...entity,
      role,
      fileRole,
      contract,
      effects,
      public: (
        isPublicRole(role, contract, entity.publicRoles) ||
        role === indexRoleName ||
        role === entryRoleName
      ),
      variant: variantOf(entity.namespace, path),
      environment: getFileEnvironment(environments, path),
    });
  });

  function entityOf(file: File): Entity | undefined {
    return describe(file);
  }

  return {
    entityOf,
    specifierOf(file) {
      return getAliasSpecifier(specifiers, toProjectPath(file));
    },
    // @debt holds the files of another environment's placement nested in a namespace directory, which the walk stops at, so they read as unclassified unless a namespace lists that placement
    withinStructure(file) {
      return nearest(posix.dirname(toProjectPath(file))) !== undefined;
    },
  };
}
