import { freeze, record, values } from "@auaust/toolkit/object";

import { resolveNamespaceStructure } from "#batiment/context/operations/resolveNamespaceStructure";
import {
  listDirectoriesRootDiagnostics,
  listNamespaceDirectories,
  listStructureDiagnostics,
  listUnreachedDeclarations,
  mergeStructureMetadata,
  resolveDomainEntries,
  type DeclaredNamespace,
  type DeclaredStructure,
  type NamespaceStructure,
  type ResolvedStructure,
  type StructureMetadata,
  type StructureNode,
  type StructureOptions,
  type TestsContext,
} from "#batiment/structure/index";
import type { EnvironmentPlacements } from "#batiment/environments/index";
import type { StructureDiagnostic } from "#batiment/report/index";
import type { Filesystem } from "#foundation/filesystem/index";
import type { Directory } from "#types/Directory";

const namespaceRoot = ".";
const projectRoot = ".";

async function resolveNamespace({
  filesystem,
  scope,
  placements,
  internals,
  namespace,
  tests,
}: {
  filesystem: Filesystem;
  scope: Directory;
  placements: EnvironmentPlacements;
  internals: boolean;
  namespace: DeclaredNamespace;
  tests?: TestsContext;
}): Promise<NamespaceStructure | undefined> {
  const {
    name,
    key,
    dirs,
    active,
    option,
    layout,
    roles,
    directoryRoles,
    origins,
  } = namespace;

  if (!option.enabled || !active) {
    return;
  }

  if (namespace.declared === undefined || namespace.read === undefined) {
    throw new Error(
      `The structured ${name} environment carries no declared structure or metafiles`,
    );
  }

  const { defined, optionPaths, ...declared } = namespace.declared;
  const { read } = namespace;
  const { optOut, strictness } = option;

  const mirrored = tests === undefined
    ? []
    : read.metadata.map(({ files }) => {
        return freeze({
          severity: "error" as const,
          code: "mirrored-metafile" as const,
          message: `${files.join(", ")} describes the mirrored ${name} environment, whose structure follows its counterparts; ignoring every metafile of ${name}`,
          blocking: true as const,
          namespace: name,
          files,
        });
      });

  const metadata = tests === undefined ? read.metadata : [];
  const directories = dirs.filter((directory) => directory !== projectRoot);
  const { [namespaceRoot]: rootDeclaration, ...below } = declared.namespaces;
  const diagnostics: StructureDiagnostic[] = [];

  function merge(
    declarations: DeclaredStructure,
    located: readonly StructureMetadata[],
  ) {
    const merged = mergeStructureMetadata({
      namespaceName: name,
      key,
      declared: declarations,
      metadata: located,
      optionPaths,
      origins,
    });

    diagnostics.push(...merged.diagnostics);

    return merged;
  }

  function toOptions({
    namespaces,
    domains,
  }: Pick<StructureOptions, "namespaces" | "domains">): StructureOptions {
    return {
      namespaces,
      domains,
      optOut,
      strictness,
    };
  }

  const spansDirectories = directories.length > 1;

  if (spansDirectories) {
    diagnostics.push(
      ...listDirectoriesRootDiagnostics({
        namespace: name,
        scope,
        directories,
        placements,
        declaration: rootDeclaration,
        configOf(field) {
          const path = `${optionPaths[namespaceRoot] ?? namespaceRoot}.${field}`;
          const origin = origins.get(path);

          return freeze({
            key,
            path,
            ...(origin === undefined ? {} : { origin }),
          });
        },
      }),
    );
  }

  const single = spansDirectories ? undefined : merge(declared, metadata);

  const perDirectory = directories.map((directory) => {
    return {
      directory,
      merged: (
        single ??
        merge(
          { namespaces: below, domains: declared.domains },
          metadata.filter((located) => located.directory === directory),
        )
      ),
    };
  });

  const rootMerged = (
    single ??
    merge(
      {
        namespaces: rootDeclaration === undefined
          ? {}
          : {
              [namespaceRoot]: { ...rootDeclaration, children: undefined },
            },
        domains: {},
      },
      [],
    )
  );

  const walked = await resolveNamespaceStructure({
    name,
    filesystem,
    scope,
    placements,
    dirs,
    options: toOptions(rootMerged),
    directories: perDirectory.map(({ directory, merged }) => {
      return { directory, options: toOptions(merged) };
    }),
    roles,
    directoryRoles,
    defined,
    internals,
    layout,
    ...(tests === undefined ? {} : { tests }),
  });

  const {
    entries: domainEntries,
    diagnostics: entryDiagnostics,
  } = resolveDomainEntries(walked.structure);

  const structure = {
    ...walked.structure,
    entries: domainEntries,
    unreached: listUnreachedDeclarations(
      single === undefined
        ? perDirectory.map(({ directory, merged }) => {
            const node = listNamespaceDirectories(walked.structure).find(
              (each) => each.directory === directory,
            )?.node;

            if (node === undefined) {
              throw new Error(`${name} walked ${directory} into no node`);
            }

            return {
              directory,
              node,
              declared,
              merged,
              metadata: metadata.filter((located) => {
                return located.directory === directory;
              }),
            };
          })
        : [
            {
              directory: directories[0] ?? projectRoot,
              node: walked.structure.root,
              declared,
              merged: single,
              metadata,
            },
          ],
    ),
  };

  return {
    ...structure,
    diagnostics: [
      ...read.diagnostics,
      ...mirrored,
      ...diagnostics,
      ...walked.diagnostics,
      ...entryDiagnostics,
      ...listStructureDiagnostics(structure),
    ],
  };
}

function freezeNode(node: StructureNode): StructureNode {
  for (const child of node.children) {
    freezeNode(child);
  }

  for (const files of values(node.roleFiles ?? {})) {
    freeze(files);
  }

  for (const globs of values(node.fileNames ?? {})) {
    freeze(globs);
  }

  for (const violation of node.cardinality ?? []) {
    freeze(violation.files);
    freeze(violation.globs);
    freeze(violation);
  }

  for (const nested of [
    node.children,
    node.layers,
    node.mirror,
    node.strays,
    node.roleFiles,
    node.fileNames,
    node.cardinality,
  ]) {
    if (nested !== undefined) {
      freeze(nested);
    }
  }

  return freeze(node);
}

// @debt the role contracts keep the `file`, `accepts`, `roles` and `rules` values of their definitions unfrozen, since freezing them in place would freeze caller-owned preset values
function freezeNamespace(
  structure: NamespaceStructure | undefined,
): NamespaceStructure | undefined {
  if (structure === undefined) {
    return;
  }

  freezeNode(structure.root);

  for (const role of values(structure.roles)) {
    freeze(role.files);
    freeze(role.ignores);
    freeze(role);
  }

  freeze(structure.dirs);
  freeze(structure.unclassified);
  freeze(structure.roles);

  for (const entry of structure.unreached) {
    freeze(entry.files);
    freeze(entry);
  }

  freeze(structure.unreached);

  freeze(structure.entries);

  for (const diagnostic of structure.diagnostics) {
    freeze(diagnostic.files);

    if (diagnostic.config !== undefined) {
      freeze(diagnostic.config);
    }

    freeze(diagnostic);
  }

  freeze(structure.diagnostics);

  return freeze(structure);
}

function mirrorOf({ option, layout }: DeclaredNamespace): boolean | undefined {
  if (layout?.nature !== "derived") {
    return;
  }

  return option.enabled && option.mirror === true;
}

export async function resolveStructure({
  filesystem,
  scope,
  placements,
  internals,
  namespaces,
}: {
  filesystem: Filesystem;
  scope: Directory;
  placements: EnvironmentPlacements;
  internals: boolean;
  namespaces: readonly DeclaredNamespace[];
}): Promise<ResolvedStructure> {
  const counterparts = namespaces.filter((namespace) => {
    return mirrorOf(namespace) === undefined;
  });

  const structures = new Map<string, NamespaceStructure | undefined>();

  for (const namespace of counterparts) {
    structures.set(
      namespace.name,
      await resolveNamespace({
        filesystem,
        scope,
        placements,
        internals,
        namespace,
      }),
    );
  }

  const tests = record(
    counterparts.map(({ name, dirs }) => {
      return [name, { dirs, structure: structures.get(name) }] as const;
    }),
  );

  for (const namespace of namespaces) {
    const mirror = mirrorOf(namespace);

    if (mirror !== undefined) {
      structures.set(
        namespace.name,
        await resolveNamespace({
          filesystem,
          scope,
          placements,
          internals,
          namespace,
          tests: { mirror, namespaces: tests },
        }),
      );
    }
  }

  return freeze(
    record(
      namespaces.map(({ name }) => {
        return [name, freezeNamespace(structures.get(name))] as const;
      }),
    ),
  );
}
