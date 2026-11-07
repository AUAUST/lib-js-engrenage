import { extname, matchesGlob, posix, relative } from "node:path";

import { memoized } from "@auaust/toolkit/memoized";
import { entries, freeze } from "@auaust/toolkit/object";

import { resolve, toPosixPath } from "#foundation/filesystem/index";
import { entryRoleName, indexRoleName } from "#project/roles/constants";
import { noRoles } from "#project/structure/constants";
import { getIndexFile } from "#project/structure/utils/getIndexFile";
import { listNamedFileRoles } from "#project/structure/utils/listNamedFileRoles";
import { matchFileRole } from "#project/structure/utils/matchFileRole";
import { resolveDomainEntries } from "#project/structure/utils/resolveDomainEntries";
import type { Alias } from "#project/structure/types/Alias";
import type { Entity } from "#project/structure/types/Entity";
import type { EntityIndex } from "#project/structure/types/EntityIndex";
import type { EnvironmentStructure } from "#project/structure/types/EnvironmentStructure";
import type { LineageMember } from "#project/structure/types/LineageMember";
import type { NamedFileRole } from "#project/structure/types/NamedFileRole";
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
  readonly named: readonly NamedFileRole[];
  readonly covers: boolean;
}

interface CodeEnvironment {
  readonly active: boolean;
  readonly dirs: Directories;
}

const projectRoot = ".";
const selfSubpath = ".";
const noLineage: readonly LineageMember[] = freeze([]);
const noNamedFileRoles: readonly NamedFileRole[] = freeze([]);

function extendLineage(
  lineage: readonly LineageMember[],
  node: StructureNode,
  path: Directory,
): readonly LineageMember[] {
  if (node.kind !== "namespace" && node.kind !== "domain") {
    return lineage;
  }

  const member: LineageMember = freeze({
    path,
    kind: node.kind,
    layer: node.layer,
    layers: node.layers,
    isolated: node.relation === "isolated",
  });

  return freeze([...lineage, member]);
}

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
    lineage: noLineage,
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
  roles: environmentRoles,
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
  roles: Readonly<Record<StructureEnvironmentName, ResolvedRoles>>;
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

  function rolesOf(name: StructureEnvironmentName | "data"): ResolvedRoles {
    return name === "data" ? noRoles : environmentRoles[name];
  }

  function register(path: Directory, located: Located) {
    if (path !== projectRoot && !directories.has(path)) {
      directories.set(path, located);
    }
  }

  // @debt public file roles (`constants.ts`) are left out of the surface, since the structure does not record which of them a domain holds
  function surfaceOf(node: StructureNode, environment: EnvironmentStructure) {
    const extension = extname(environment.indexFile);
    const entry = publicEntries.get(`${node.path}/${environment.entryFile}`);

    // @debt reads a child role's visibility from the environment's roles, which miss the scoped roles a namespace enables; `environment.roles` holds every role the walk met
    const roles = node.children
      .filter((child) => {
        return (
          child.kind === "role" &&
          child.role !== undefined &&
          environmentRoles[environment.name].roles[child.role]?.public
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
    const roles = environmentRoles[environment.name];

    const contract =
      role === undefined ? undefined : environment.roles[role]?.contract;

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
      lineage: extendLineage(parent.lineage, node, node.path),
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
      named,
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
        lineage: extendLineage(noLineage, tree, directory),
      });

      register(directory, {
        entity,
        roles: environmentRoles[name],
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
          entity: createEntity(name, directory),
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
          entity: createEntity("workspace", directory, glob),
          roles: undefined,
          named: noNamedFileRoles,
          covers: true,
        });
      }
    }
  }

  if (outDir !== undefined) {
    register(outDir, {
      entity: createEntity("dist", outDir),
      roles: undefined,
      named: noNamedFileRoles,
      covers: true,
    });
  }

  const nearest = memoized(
    (
      directory: Directory,
    ): { readonly path: Directory; readonly located: Located } | undefined => {
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

  function locate(directory: Directory): Located | undefined {
    const found = nearest(directory);

    return found !== undefined &&
      (found.path === directory || found.located.covers)
      ? found.located
      : undefined;
  }

  function toProjectPath(file: File): string {
    return toPosixPath(relative(root, resolve(root, file)));
  }

  function classify(
    name: string,
    directory: Directory,
    { entity, roles, named }: Located,
  ): Pick<Entity, "role" | "fileRole" | "contract" | "effects"> {
    const atRoot = directory === entity.path;

    const matched = matchFileRole(name, {
      named: atRoot ? named : noNamedFileRoles,
      enclosing: entity.role,
      roles,
    });

    const nested = named.find((candidate) => candidate.name === matched);

    if (atRoot && nested !== undefined) {
      return {
        role: nested.name,
        fileRole: nested.name,
        contract: nested.contract,
        effects: nested.contract.effects,
      };
    }

    if (entity.role !== undefined) {
      const isBarrel =
        entity.contract?.index === true &&
        roles !== undefined &&
        name === getIndexFile(roles);

      return {
        role: entity.role,
        fileRole: isBarrel ? indexRoleName : undefined,
        contract: entity.contract,
        effects: entity.effects,
      };
    }

    const role = atRoot ? matched : undefined;
    const contract = role === undefined ? undefined : roles?.roles[role];

    return {
      role,
      fileRole: matched,
      contract,
      effects: contract?.effects,
    };
  }

  const describe = memoized((file: File): Entity | undefined => {
    const path = toProjectPath(file);
    const directory = posix.dirname(path);
    const located = locate(directory);

    if (located === undefined) {
      return;
    }

    const { entity } = located;

    const { role, fileRole, contract, effects } = classify(
      posix.basename(path),
      directory,
      located,
    );

    return freeze({
      ...entity,
      role,
      fileRole,
      contract,
      effects,
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

  return {
    entityOf,
    specifierOf(file) {
      return specifierOf(specifiers, toProjectPath(file));
    },
    withinEnvironment(file) {
      return nearest(posix.dirname(toProjectPath(file))) !== undefined;
    },
  };
}
