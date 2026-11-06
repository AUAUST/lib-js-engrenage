import { extname, matchesGlob, posix, relative } from "node:path";

import { wrap } from "@auaust/primitive-kit/arrays";
import { memoized } from "@auaust/toolkit/memoized";
import { entries, freeze } from "@auaust/toolkit/object";

import { resolve, toPosixPath } from "#foundation/filesystem/index";
import { entryRoleName, indexRoleName } from "#project/roles/constants";
import { getIndexFile } from "#project/structure/utils/getIndexFile";
import { resolveDomainEntries } from "#project/structure/utils/resolveDomainEntries";
import type { Alias } from "#project/structure/types/Alias";
import type { Entity } from "#project/structure/types/Entity";
import type { EntityIndex } from "#project/structure/types/EntityIndex";
import type { EnvironmentStructure } from "#project/structure/types/EnvironmentStructure";
import type { ResolvedAliases } from "#project/structure/types/ResolvedAliases";
import type { ResolvedRoles } from "#project/structure/types/ResolvedRoles";
import type { ResolvedStructure } from "#project/structure/types/ResolvedStructure";
import type { StructureEnvironmentName } from "#project/structure/types/StructureEnvironmentName";
import type { StructureNode } from "#project/structure/types/StructureNode";
import type { TestVariant } from "#project/structure/types/TestVariant";
import type { Directories } from "#types/Directories";
import type { Directory } from "#types/Directory";
import type { File } from "#types/File";
import type { Glob } from "#types/Glob";
import type { Globs } from "#types/Globs";

interface Located {
  readonly entity: Entity;
  readonly roles: ResolvedRoles | undefined;
  readonly covers: boolean;
}

interface CodeEnvironment {
  readonly active: boolean;
  readonly dirs: Directories;
  readonly roles: ResolvedRoles;
}

const projectRoot = ".";
const selfSubpath = ".";

function createEntity(
  environment: Entity["environment"],
  path: Directory,
  workspace?: Glob,
): Entity {
  return freeze({
    environment,
    workspace,
    path,
    kind: undefined,
    commands: false,
    namespace: undefined,
    layer: undefined,
    domain: undefined,
    surface: freeze([]),
    role: undefined,
    fileRole: undefined,
    contract: undefined,
    effects: undefined,
    public: false,
    variant: undefined,
  });
}

function specifierOf(aliases: readonly Alias[], path: string) {
  for (const { key, target } of aliases) {
    const normalized = posix.normalize(target);
    const star = normalized.indexOf("*");
    const keyStar = key.indexOf("*");

    if (star === -1 || keyStar === -1) {
      if (star === -1 && keyStar === -1 && normalized === path) {
        return key;
      }

      continue;
    }

    const prefix = normalized.slice(0, star);
    const suffix = normalized.slice(star + 1);

    if (
      path.startsWith(prefix) &&
      path.endsWith(suffix) &&
      path.length >= prefix.length + suffix.length
    ) {
      return key.replace("*", () => {
        return path.slice(prefix.length, path.length - suffix.length);
      });
    }
  }
}

export function createEntityIndex({
  root,
  structure,
  environments,
  testPatterns,
  workspaces,
  outDir,
  aliases,
  packageName,
}: {
  root: Directory;
  structure: ResolvedStructure;
  environments: Readonly<
    Record<StructureEnvironmentName | "data", CodeEnvironment>
  >;
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
  const directories = new Map<Directory, Located>();
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

  function register(path: Directory, located: Located) {
    if (path !== projectRoot && !directories.has(path)) {
      directories.set(path, located);
    }
  }

  // @debt public file roles (`constants.ts`) are left out of the surface, since the structure does not record which of them a domain holds
  function surfaceOf(node: StructureNode, environment: EnvironmentStructure) {
    const extension = extname(environment.indexFile);
    const entry = publicEntries.get(`${node.path}/${environment.entryFile}`);

    const roles = node.children
      .filter((child) => {
        return (
          child.kind === "role" &&
          child.role !== undefined &&
          environments[environment.name].roles.roles[child.role]?.public
        );
      })
      .map((child) => specifierOf(specifiers, `${child.path}/*${extension}`));

    return freeze(
      [
        specifierOf(specifiers, posix.join(node.path, environment.indexFile)),
        ...roles,
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
    const { roles } = environments[environment.name];

    // @debt a scoped role (`config/schemas`) has no contract in the environment's roles, so lint skips its contract; `environment.roles` holds it, and switching to it reports three modules of this repository's `config/schemas`
    const contract = role === undefined ? undefined : roles.roles[role];

    const entity: Entity = freeze({
      ...parent,
      path: node.path,
      kind: node.kind,
      commands: node.commands === true,
      namespace:
        node.kind === "namespace"
          ? freeze({
              path: node.path,
              isolated: node.relation === "isolated",
            })
          : parent.namespace,
      layer: node.layer ?? parent.layer,
      domain:
        node.kind === "domain"
          ? node.path.slice(directory.length + 1)
          : parent.domain,
      surface:
        node.kind === "domain" ? surfaceOf(node, environment) : parent.surface,
      role,
      contract,
      effects: role === undefined ? undefined : node.effects,
      public: contract?.public === true,
    });

    register(node.path, {
      entity,
      roles,
      covers: node.kind === "role",
    });

    for (const child of node.children) {
      visit(child, entity, environment, directory);
    }
  }

  for (const environment of [
    structure.src,
    structure.tests,
    structure.bin,
    structure.scripts,
    structure.tooling,
  ]) {
    if (environment === undefined) {
      continue;
    }

    const { root: tree, name } = environment;

    for (const directory of environment.dirs) {
      const entity: Entity = freeze({
        ...createEntity(name, directory),
        kind: tree.kind,
        commands: tree.commands === true,
        namespace: freeze({
          path: directory,
          isolated: tree.relation === "isolated",
        }),
      });

      register(directory, {
        entity,
        roles: environments[name].roles,
        covers: false,
      });

      for (const child of tree.children) {
        if (child.path.startsWith(`${directory}/`)) {
          visit(child, entity, environment, directory);
        }
      }
    }
  }

  for (const [name, { active, dirs, roles }] of entries(environments)) {
    if (active) {
      for (const directory of dirs) {
        register(directory, {
          entity: createEntity(name, directory),
          roles,
          covers: true,
        });
      }
    }
  }

  for (const { glob, active, dirs } of workspaces) {
    if (active) {
      for (const directory of dirs) {
        register(directory, {
          entity: createEntity("workspace", directory, glob),
          roles: undefined,
          covers: true,
        });
      }
    }
  }

  if (outDir !== undefined) {
    register(outDir, {
      entity: createEntity("dist", outDir),
      roles: undefined,
      covers: true,
    });
  }

  const locate = memoized((directory: Directory): Located | undefined => {
    for (
      let current = directory, parent = posix.dirname(current);
      current !== parent;
      current = parent, parent = posix.dirname(current)
    ) {
      const located = directories.get(current);

      if (located !== undefined) {
        return current === directory || located.covers ? located : undefined;
      }
    }
  });

  function fileRoleOf(name: string, roles: ResolvedRoles | undefined) {
    if (roles === undefined) {
      return;
    }

    if (name === getIndexFile(roles)) {
      return indexRoleName;
    }

    return entries(roles.roles).find(([, { file }]) => {
      return wrap(file ?? []).some((glob) => matchesGlob(name, glob));
    })?.[0];
  }

  const describe = memoized((file: File): Entity | undefined => {
    const path = toPosixPath(relative(root, resolve(root, file)));
    const directory = posix.dirname(path);
    const located = locate(directory);

    if (located === undefined) {
      return;
    }

    const { entity, roles } = located;
    const fileRole = fileRoleOf(posix.basename(path), roles);

    const role =
      entity.role ?? (directory === entity.path ? fileRole : undefined);

    const contract =
      entity.role === undefined
        ? role === undefined
          ? undefined
          : roles?.roles[role]
        : entity.contract;

    return freeze({
      ...entity,
      role,
      fileRole,
      contract,
      effects: entity.role === undefined ? contract?.effects : entity.effects,
      public:
        contract?.public === true ||
        role === indexRoleName ||
        role === entryRoleName,
      variant:
        entity.environment === "tests"
          ? variants.find(([, globs]) => {
              return globs.some((glob) => matchesGlob(path, glob));
            })?.[0]
          : undefined,
    });
  });

  function entityOf(file: File): Entity | undefined {
    return describe(file);
  }

  return { entityOf };
}
