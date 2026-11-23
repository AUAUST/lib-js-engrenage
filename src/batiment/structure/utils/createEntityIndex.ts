import { extname, matchesGlob, posix, relative } from "node:path";

import { toSorted } from "@auaust/toolkit/array";
import { memoize } from "@auaust/toolkit/function";
import { entries, freeze, getOwn, values } from "@auaust/toolkit/object";

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
import { listNamedFileRoles } from "#batiment/structure/utils/listNamedFileRoles";
import { resolve, toPosixPath } from "#foundation/filesystem/index";
import type { ResolvedRoles } from "#batiment/roles/index";
import type { EntityIndex } from "#batiment/structure/apis/EntityIndex";
import type { Entity } from "#batiment/structure/types/Entity";
import type { EnvironmentStructure } from "#batiment/structure/types/EnvironmentStructure";
import type { LineageMember } from "#batiment/structure/types/LineageMember";
import type { LocatedEntity } from "#batiment/structure/types/LocatedEntity";
import type { NamedFileRole } from "#batiment/structure/types/NamedFileRole";
import type { ResolvedAliases } from "#batiment/structure/types/ResolvedAliases";
import type { ResolvedStructure } from "#batiment/structure/types/ResolvedStructure";
import type { StructureNode } from "#batiment/structure/types/StructureNode";
import type { Directories } from "#types/Directories";
import type { Directory } from "#types/Directory";
import type { File } from "#types/File";
import type { Globs } from "#types/Globs";

interface CodeEnvironment {
  readonly active: boolean;
  readonly dirs: Directories;
}

const projectRoot = ".";
const selfSubpath = ".";
const noLineage: readonly LineageMember[] = freeze([]);
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
  environments,
  roles: environmentRoles,
  testPatterns,
  scopes,
  outDir,
  aliases,
  packageName,
}: {
  root: Directory;
  structure: ResolvedStructure;
  environments: Readonly<Record<string, CodeEnvironment>>;
  roles: Readonly<Partial<Record<string, ResolvedRoles>>>;
  testPatterns: Readonly<Partial<Record<string, Globs>>>;
  scopes: ScopeTree;
  outDir: Directory | undefined;
  aliases: ResolvedAliases;
  packageName: string | undefined;
}): EntityIndex {
  const directories = new Map<Directory, LocatedEntity>();
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

  function variantOf(environment: string | undefined, path: string) {
    if (environment !== undefined) {
      return variants.get(environment)?.find(({ name }) => {
        return (getOwn(testPatterns, name) ?? []).some((glob) => {
          return matchesGlob(path, glob);
        });
      })?.name;
    }
  }

  function rolesOf(name: string): ResolvedRoles {
    return getOwn(environmentRoles, name) ?? noRoles;
  }

  function register(path: Directory, located: LocatedEntity) {
    if (path !== projectRoot && !directories.has(path)) {
      directories.set(path, located);
    }
  }

  function surfaceOf(node: StructureNode, environment: EnvironmentStructure) {
    const extension = extname(environment.indexFile);

    const entry = publicEntries.get(`${node.path}/${environment.entryFile}`);

    // @debt reads a child role's visibility from the environment's roles, which miss the opt-in roles a namespace enables; `environment.roles` holds every role the walk met
    const roles = node.children
      .filter((child) => {
        return (
          child.kind === "role" &&
          child.role !== undefined &&
          rolesOf(environment.name).roles[child.role]?.public
        );
      })
      .map((child) => {
        return getAliasSpecifier(specifiers, `${child.path}/*${extension}`);
      });

    const roleFiles = entries(node.roleFiles ?? {}).flatMap(([role, files]) => {
      return rolesOf(environment.name).roles[role]?.public ? files : [];
    });

    const barrels = node.children
      .filter((child) => child.kind === "role")
      .map((child) => posix.join(child.path, environment.indexFile));

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
          posix.join(node.path, environment.indexFile),
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
    environment: EnvironmentStructure,
    directory: Directory,
  ) {
    const role = node.kind === "role" ? node.role : undefined;
    const roles = rolesOf(environment.name);

    const contract = role === undefined
      ? undefined
      : environment.roles[role]?.contract;

    const named = freeze(
      listNamedFileRoles(
        contract?.roles ?? [],
        (name) => {
          return environment.roles[name]?.contract;
        },
        node.fileNames,
      ),
    );

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
        ? surfaceOf(node, environment)
        : parent.surface,
      collects: node.kind === "domain"
        ? freeze([...(node.collects ?? [])])
        : parent.collects,
      role,
      contract,
      effects: role === undefined ? undefined : node.effects,
      public: contract?.public === true,
    });

    register(node.path, {
      entity,
      roles,
      named,
      covers: node.kind === "role",
    });

    for (const child of node.children) {
      visit(child, entity, environment, directory);
    }
  }

  for (const environment of values(structure)) {
    if (environment === undefined) {
      continue;
    }

    const { root: tree, name } = environment;

    for (const directory of environment.dirs) {
      const entity: Entity = freeze({
        ...createStructureEntity(name, directory, rootScope),
        kind: tree.kind,
        group: tree.group === true,
        lineage: extendEntityLineage(noLineage, tree, directory),
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

      for (const child of tree.children) {
        if (child.path.startsWith(`${directory}/`)) {
          visit(child, entity, environment, directory);
        }
      }
    }
  }

  for (const [name, { active, dirs }] of entries(environments)) {
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
        contract?.public === true ||
        role === indexRoleName ||
        role === entryRoleName
      ),
      variant: variantOf(entity.environment, path),
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
    withinEnvironment(file) {
      return nearest(posix.dirname(toProjectPath(file))) !== undefined;
    },
  };
}
