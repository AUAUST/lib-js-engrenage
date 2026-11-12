import { extname, matchesGlob, posix, relative } from "node:path";

import { memoized } from "@auaust/toolkit/memoized";
import { entries, freeze, getOwn, values } from "@auaust/toolkit/object";

import { resolve, toPosixPath } from "#foundation/filesystem/index";
import { entryRoleName, indexRoleName } from "#project/roles/constants";
import { noRoles } from "#project/structure/constants";
import { classifyEntityFile } from "#project/structure/utils/classifyEntityFile";
import { createStructureEntity } from "#project/structure/utils/createStructureEntity";
import { extendEntityLineage } from "#project/structure/utils/extendEntityLineage";
import { extendRoleLocation } from "#project/structure/utils/extendRoleLocation";
import { getAliasSpecifier } from "#project/structure/utils/getAliasSpecifier";
import { listNamedFileRoles } from "#project/structure/utils/listNamedFileRoles";
import { resolveDomainEntries } from "#project/structure/utils/resolveDomainEntries";
import type { Entity } from "#project/structure/types/Entity";
import type { EntityIndex } from "#project/structure/types/EntityIndex";
import type { EnvironmentStructure } from "#project/structure/types/EnvironmentStructure";
import type { LineageMember } from "#project/structure/types/LineageMember";
import type { LocatedEntity } from "#project/structure/types/LocatedEntity";
import type { NamedFileRole } from "#project/structure/types/NamedFileRole";
import type { ResolvedAliases } from "#project/structure/types/ResolvedAliases";
import type { ResolvedRoles } from "#project/structure/types/ResolvedRoles";
import type { ResolvedStructure } from "#project/structure/types/ResolvedStructure";
import type { StructureNode } from "#project/structure/types/StructureNode";
import type { TestVariant } from "#project/structure/types/TestVariant";
import type { Directories } from "#types/Directories";
import type { Directory } from "#types/Directory";
import type { File } from "#types/File";
import type { Glob } from "#types/Glob";
import type { Globs } from "#types/Globs";

interface CodeEnvironment {
  readonly active: boolean;
  readonly dirs: Directories;
}

const projectRoot = ".";
const selfSubpath = ".";
const noLineage: readonly LineageMember[] = freeze([]);
const noNamedFileRoles: readonly NamedFileRole[] = freeze([]);

export function createEntityIndex({
  root,
  structure,
  environments,
  roles: environmentRoles,
  testPatterns,
  workspaces,
  outDir,
  aliases,
  packageName,
}: {
  root: Directory;
  structure: ResolvedStructure;
  environments: Readonly<Record<string, CodeEnvironment>>;
  roles: Readonly<Partial<Record<string, ResolvedRoles>>>;
  testPatterns: {
    readonly plain: Globs;
    readonly source: Globs;
    readonly dist: Globs;
  };
  workspaces: readonly {
    readonly glob: Glob;
    readonly active: boolean;
    readonly dirs: Directories;
  }[];
  outDir: Directory | undefined;
  aliases: ResolvedAliases;
  packageName: string | undefined;
}): EntityIndex {
  const directories = new Map<Directory, LocatedEntity>();
  const specifiers = [...aliases.src, ...aliases.global];

  const publicEntries = new Map(
    entries(resolveDomainEntries(structure.src)).map(([subpath, file]) => {
      return [file, subpath] as const;
    }),
  );

  const variants: readonly (readonly [TestVariant, Globs])[] = [
    ["src", testPatterns.source],
    ["dist", testPatterns.dist],
    ["plain", testPatterns.plain],
  ];

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

    // @debt reads a child role's visibility from the environment's roles, which miss the scoped roles a namespace enables; `environment.roles` holds every role the walk met
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

    // @debt `surfaceOf` runs for domains only, so an environment-root role barrel exposed as a subpath gets no package specifier in any surface
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
      commands: node.commands === true,
      lineage: extendEntityLineage(parent.lineage, node, node.path),
      location: extendRoleLocation(parent.location, node),
      domain: node.kind === "domain"
        ? node.path.slice(directory.length + 1)
        : parent.domain,
      surface: node.kind === "domain"
        ? surfaceOf(node, environment)
        : parent.surface,
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
        ...createStructureEntity(name, directory),
        kind: tree.kind,
        commands: tree.commands === true,
        lineage: extendEntityLineage(noLineage, tree, directory),
        location: extendRoleLocation(
          createStructureEntity(name, directory).location,
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
          entity: createStructureEntity(name, directory),
          roles: rolesOf(name),
          named: noNamedFileRoles,
          covers: true,
        });
      }
    }
  }

  for (const { glob, active, dirs } of workspaces) {
    if (active) {
      for (const directory of dirs) {
        register(directory, {
          entity: createStructureEntity("workspace", directory, glob),
          roles: undefined,
          named: noNamedFileRoles,
          covers: true,
        });
      }
    }
  }

  if (outDir !== undefined) {
    register(outDir, {
      entity: createStructureEntity("dist", outDir),
      roles: undefined,
      named: noNamedFileRoles,
      covers: true,
    });
  }

  const nearest = memoized(
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

  const describe = memoized((file: File): Entity | undefined => {
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
      variant: entity.environment === "tests"
        ? variants.find(([, globs]) => {
            return globs.some((glob) => matchesGlob(path, glob));
          })?.[0]
        : undefined,
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
