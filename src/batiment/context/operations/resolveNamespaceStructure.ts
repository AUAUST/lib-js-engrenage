import { basename, posix } from "node:path";

import { flat, sort } from "@auaust/toolkit/array";
import { entries, freeze, getOwn, keys } from "@auaust/toolkit/object";

import { assignRoleFiles } from "#batiment/context/operations/assignRoleFiles";
import { createStructureDomainResolver } from "#batiment/context/operations/createStructureDomainResolver";
import { createStructureRoleResolver } from "#batiment/context/operations/createStructureRoleResolver";
import { createStructureWalker } from "#batiment/context/operations/createStructureWalker";
import {
  listForeignPlacements,
  type EnvironmentPlacements,
} from "#batiment/environments/index";
import {
  getEntryFile,
  getIndexFile,
  type NamespaceRoles,
  type ResolvedRoles,
  type RoleRegistry,
} from "#batiment/roles/index";
import {
  collectStructureNodes,
  createMirrorClassifier,
  getStructureLayer,
  groupRoleFiles,
  listStructureRoles,
  listTestsRootDiagnostics,
  loosenStructureNode,
  type Layout,
  type NamespaceStructure,
  type StructureNode,
  type StructureOptions,
  type TestsContext,
} from "#batiment/structure/index";
import type { StructureDiagnostic } from "#batiment/report/index";
import type { Filesystem } from "#foundation/filesystem/index";
import type { Directories } from "#types/Directories";
import type { Directory } from "#types/Directory";

const namespaceRoot = ".";

function dropCollects(
  node: StructureNode,
  dropped: ReadonlyMap<Directory, ReadonlySet<string>>,
): StructureNode {
  const roles = dropped.get(node.path);

  return freeze({
    ...node,
    ...(roles === undefined || node.collects === undefined
      ? {}
      : { collects: node.collects.filter((role) => !roles.has(role)) }),
    children: node.children.map((child) => dropCollects(child, dropped)),
  });
}

type NamespaceDeclaration = StructureOptions["namespaces"][string];

function describeNamespace(
  declaration: NamespaceDeclaration | undefined,
): Partial<StructureNode> {
  return {
    ...(declaration?.layers === undefined
      ? {}
      : { layers: declaration.layers }),
    ...(declaration === undefined ? {} : { relation: declaration.relation }),
    ...(declaration?.children === undefined
      ? {}
      : { childKind: declaration.children }),
    ...(declaration?.purpose === undefined
      ? {}
      : { purpose: declaration.purpose }),
    ...(declaration?.debt === undefined ? {} : { debt: declaration.debt }),
  };
}

export async function resolveNamespaceStructure({
  name,
  filesystem,
  scope,
  placements,
  dirs,
  options,
  directories,
  roles,
  directoryRoles,
  defined,
  tests,
  layout,
  internals = false,
}: {
  name: string;
  filesystem: Filesystem;
  scope: Directory;
  placements: EnvironmentPlacements;
  dirs: Directories;
  options: StructureOptions;
  directories: readonly {
    readonly directory: Directory;
    readonly options: StructureOptions;
  }[];
  internals?: boolean;
  roles?: NamespaceRoles | undefined;
  directoryRoles: ReadonlyMap<Directory, NamespaceRoles>;
  defined?: RoleRegistry;
  tests?: TestsContext;
  layout?: Layout | undefined;
}): Promise<{
  readonly structure: Omit<
    NamespaceStructure,
    "unreached" | "diagnostics" | "entries"
  >;
  readonly diagnostics: readonly StructureDiagnostic[];
}> {
  const { strictness, namespaces } = options;
  const group = layout?.nature === "recursive";
  const diagnostics: StructureDiagnostic[] = [];

  function report(diagnostic: StructureDiagnostic) {
    diagnostics.push(diagnostic);
  }

  const roleResolver = createStructureRoleResolver({
    name,
    filesystem,
    roles,
    defined,
  });

  const { rolesFor } = roleResolver;
  const rolesIn = new Map<StructureNode, ResolvedRoles>();
  const indexFile = getIndexFile(rolesFor([]));
  const entryFile = getEntryFile(rolesFor([]));

  const classifyMirror = tests === undefined
    ? undefined
    : createMirrorClassifier(tests);

  if (tests !== undefined) {
    diagnostics.push(...listTestsRootDiagnostics(name, tests));
  }

  const rootDeclaration = namespaces[namespaceRoot];
  const spansDirectories = directories.length > 1;

  function roleResolverOf(directory: Directory) {
    if (!spansDirectories || roles === undefined) {
      return roleResolver;
    }

    const own = directoryRoles.get(directory);

    if (own === undefined) {
      throw new Error(
        `The ${name} namespace spans ${directory}, which its host gave no roles`,
      );
    }

    return createStructureRoleResolver({
      name,
      filesystem,
      roles: own,
      defined,
    });
  }

  const walked = await Promise.all(
    directories.map(async ({ directory, options: directoryOptions }) => {
      const declaration = directoryOptions.namespaces[namespaceRoot];
      const scopes = declaration?.roles.enable ?? [];
      const directoryRoleResolver = roleResolverOf(directory);
      const directoryRolesFor = directoryRoleResolver.rolesFor;

      const domainResolver = createStructureDomainResolver({
        name,
        filesystem,
        options: directoryOptions,
        group,
        entryFile,
        internals,
        rolesFor: directoryRolesFor,
        report,
      });

      const walk = createStructureWalker({
        filesystem,
        options: directoryOptions,
        group,
        layoutEntries: layout?.nature === "static" ? layout.entries : undefined,
        indexFile,
        rolesIn,
        roleResolver: directoryRoleResolver,
        domainResolver,
        classifyMirror,
        stops: [
          ...listForeignPlacements(placements, directory).map(({ dir }) => dir),
          ...directories
            .map((other) => other.directory)
            .filter((other) => other.startsWith(`${directory}/`)),
        ],
      });

      const children = await walk(directory, namespaceRoot, {
        kind: "root",
        layers: declaration?.layers,
        ...(declaration?.children === undefined
          ? {}
          : { childKind: declaration.children }),
        scopes,
        owned: scopes,
        structured: false,
        source: declaration?.source ?? "inferred",
        location: freeze({
          namespace: name,
          lineage: freeze([
            freeze({
              name: basename(directory),
              path: directory,
              kind: "namespace" as const,
            }),
          ]),
          roles: freeze([]),
        }),
      });

      const rootRoles = directoryRolesFor(scopes);

      const roleFiles = groupRoleFiles(
        await assignRoleFiles(filesystem, directory, rootRoles),
      );

      return {
        directory,
        rootRoles,
        declaration,
        domainResolver,
        children,
        roleFiles,
      };
    }),
  );

  const children = flat(walked.map((each) => each.children));

  if (layout?.nature === "static") {
    const present = new Set(children.map((child) => child.name));

    for (const child of children) {
      if (getOwn(layout.entries, child.name) === undefined) {
        report(
          freeze({
            severity: "error",
            code: "unlisted-layout-entry",
            message: `${child.path} is no entry of the ${layout.name} layout of ${name}: ${keys(layout.entries).join(", ")}`,
            blocking: true,
            namespace: name,
            files: freeze([]),
          }),
        );
      }
    }

    for (const [entry, { required }] of entries(layout.entries)) {
      if (required === true && !present.has(entry)) {
        report(
          freeze({
            severity: "error",
            code: "missing-layout-entry",
            message: `${name} lacks ${entry}, a required entry of its ${layout.name} layout`,
            blocking: true,
            namespace: name,
            files: freeze([]),
          }),
        );
      }
    }
  }

  const rootRoleFiles = spansDirectories ? {} : (walked[0]?.roleFiles ?? {});

  const resolvedRoot: StructureNode = freeze({
    path: namespaceRoot,
    name,
    kind: "namespace",
    source: rootDeclaration?.source ?? "inferred",
    ...(group ? { group: true as const } : {}),
    ...describeNamespace(rootDeclaration),
    ...(keys(rootRoleFiles).length === 0 ? {} : { roleFiles: rootRoleFiles }),
    children: spansDirectories
      ? walked.map((each): StructureNode => {
          const directoryName = posix.relative(scope, each.directory);

          const layer = getStructureLayer(
            directoryName,
            rootDeclaration?.layers,
          );

          return freeze({
            path: each.directory,
            name: directoryName,
            kind: "directory",
            source: each.declaration?.source ?? "inferred",
            ...(layer === undefined ? {} : { layer }),
            ...describeNamespace(each.declaration),
            ...(keys(each.roleFiles).length === 0
              ? {}
              : { roleFiles: each.roleFiles }),
            children: each.children,
          });
        })
      : children,
  });

  const structureRoles = listStructureRoles(
    resolvedRoot,
    walked.map(({ directory, rootRoles }) => {
      return { directory, roles: rootRoles };
    }),
    rolesIn,
  );

  const dropped = new Map<Directory, ReadonlySet<string>>();

  for (const { path, collects } of collectStructureNodes(resolvedRoot)) {
    const invalid = (collects ?? []).filter((role) => {
      const contract = getOwn(structureRoles, role)?.contract;

      return contract === undefined || !contract.public || !contract.collected;
    });

    if (invalid.length > 0) {
      dropped.set(path, new Set(invalid));
    }

    const source = walked
      .map(({ domainResolver }) => domainResolver.collectsSourceOf(path))
      .find((found) => found !== undefined);

    for (const role of invalid) {
      report(
        freeze({
          severity: "error",
          code: "collected-role-not-public",
          message: `${path} collects the role ${role}, which is not a public collected role of its environment; dropping it from its collects`,
          blocking: true,
          namespace: name,
          files: freeze([...(source?.files ?? [])]),
          ...(source?.config === undefined ? {} : { config: source.config }),
        }),
      );
    }
  }

  const collectedRoot = dropped.size === 0
    ? resolvedRoot
    : dropCollects(resolvedRoot, dropped);

  const rootNode = strictness === "loose"
    ? loosenStructureNode(
        collectedRoot,
        layout?.nature === "derived" ? "mirror" : "domain",
      )
    : collectedRoot;

  const sorted = sort(diagnostics, (left, right) => {
    return left.message.localeCompare(right.message);
  });

  return freeze({
    structure: freeze({
      name,
      dirs,
      indexFile,
      entryFile,
      strictness,
      ...(layout === undefined ? {} : { layout }),
      root: rootNode,
      unclassified: collectStructureNodes(rootNode).filter(
        ({ kind }) => kind === "unclassified",
      ),
      roles: structureRoles,
    }),
    diagnostics: freeze(sorted),
  });
}
