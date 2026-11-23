import { matchesGlob, posix } from "node:path";

import { freeze, hasOwn, keys, record, values } from "@auaust/toolkit/object";

import { resolveEnvironmentStructure } from "#batiment/context/operations/resolveEnvironmentStructure";
import {
  collectStructureNodes,
  listStructureDiagnostics,
  mergeStructureMetadata,
  resolveDomainEntries,
  type DeclaredEnvironment,
  type DeclaredStructure,
  type EnvironmentStructure,
  type ResolvedStructure,
  type StructureMetadata,
  type StructureNode,
  type StructureOptions,
  type TestsContext,
} from "#batiment/structure/index";
import type { Filesystem } from "#foundation/filesystem/index";

function listUnreached({
  structure,
  declared,
  merged,
  metadata,
}: {
  structure: Omit<
    EnvironmentStructure,
    "unreached" | "diagnostics" | "entries"
  >;
  declared: DeclaredStructure;
  merged: Pick<StructureOptions, "namespaces" | "domains">;
  metadata: readonly StructureMetadata[];
}): EnvironmentStructure["unreached"] {
  const walked = structure.dirs.filter((directory) => directory !== ".");

  const subpaths = collectStructureNodes(structure.root).flatMap((node) => {
    return walked
      .map((directory) => posix.relative(directory, node.path))
      .filter((subpath) => {
        return subpath !== ".." && !subpath.startsWith("../");
      })
      .map((subpath) => {
        return { subpath: subpath === "" ? "." : subpath, kind: node.kind };
      });
  });

  const reached = new Set([".", ...subpaths.map(({ subpath }) => subpath)]);

  const domainSubpaths = subpaths
    .filter(({ kind }) => kind === "domain")
    .map(({ subpath }) => subpath);

  function entry(path: string, kind: "namespace" | "domain") {
    return {
      path,
      kind,
      config: hasOwn(
        kind === "namespace" ? declared.namespaces : declared.domains,
        path,
      ),
      files: metadata.find((located) => located.path === path)?.files ?? [],
    };
  }

  return [
    ...keys(merged.namespaces)
      .filter((path) => !reached.has(path))
      .map((path) => entry(path, "namespace")),
    ...keys(merged.domains)
      .filter((path) => {
        return (
          !reached.has(path) &&
          !domainSubpaths.some((subpath) => matchesGlob(subpath, path))
        );
      })
      .map((path) => entry(path, "domain")),
  ].sort((left, right) => left.path.localeCompare(right.path));
}

async function resolveEnvironment({
  filesystem,
  internals,
  environment,
  tests,
}: {
  filesystem: Filesystem;
  internals: boolean;
  environment: DeclaredEnvironment;
  tests?: TestsContext;
}): Promise<EnvironmentStructure | undefined> {
  const {
    name,
    key,
    dirs,
    active,
    option,
    layout,
    roles,
    origins,
  } = environment;

  if (!option.enabled || !active) {
    return;
  }

  if (environment.declared === undefined || environment.read === undefined) {
    throw new Error(
      `The structured ${name} environment carries no declared structure or metafiles`,
    );
  }

  const { defined, optionPaths, ...declared } = environment.declared;
  const { read } = environment;

  const mirrored = tests === undefined
    ? []
    : read.metadata.map(({ files }) => {
        return freeze({
          severity: "error" as const,
          code: "mirrored-metafile" as const,
          message: `${files.join(", ")} describes the mirrored ${name} environment, whose structure follows its counterparts; ignoring every metafile of ${name}`,
          blocking: true as const,
          environment: name,
          files,
        });
      });

  const metadata = tests === undefined ? read.metadata : [];

  const merged = mergeStructureMetadata({
    environment: name,
    key,
    declared,
    metadata,
    optionPaths,
    origins,
  });

  const { namespaces, domains } = merged;

  const walked = await resolveEnvironmentStructure({
    name,
    filesystem,
    dirs,
    options: {
      namespaces,
      domains,
      optOut: option.optOut,
      strictness: option.strictness,
    },
    roles,
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
    unreached: listUnreached({
      structure: walked.structure,
      declared,
      merged,
      metadata,
    }),
  };

  return {
    ...structure,
    diagnostics: [
      ...read.diagnostics,
      ...mirrored,
      ...merged.diagnostics,
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
function freezeEnvironment(
  structure: EnvironmentStructure | undefined,
): EnvironmentStructure | undefined {
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

function mirrorOf({
  option,
  layout,
}: DeclaredEnvironment): boolean | undefined {
  if (layout?.nature !== "derived") {
    return;
  }

  return option.enabled && option.mirror === true;
}

export async function resolveStructure({
  filesystem,
  internals,
  environments,
}: {
  filesystem: Filesystem;
  internals: boolean;
  environments: readonly DeclaredEnvironment[];
}): Promise<ResolvedStructure> {
  const counterparts = environments.filter((environment) => {
    return mirrorOf(environment) === undefined;
  });

  const structures = new Map<string, EnvironmentStructure | undefined>();

  for (const environment of counterparts) {
    structures.set(
      environment.name,
      await resolveEnvironment({
        filesystem,
        internals,
        environment,
      }),
    );
  }

  const tests = record(
    counterparts.map(({ name, dirs }) => {
      return [name, { dirs, structure: structures.get(name) }] as const;
    }),
  );

  for (const environment of environments) {
    const mirror = mirrorOf(environment);

    if (mirror !== undefined) {
      structures.set(
        environment.name,
        await resolveEnvironment({
          filesystem,
          internals,
          environment,
          tests: { mirror, environments: tests },
        }),
      );
    }
  }

  return freeze(
    record(
      environments.map(({ name }) => {
        return [name, freezeEnvironment(structures.get(name))] as const;
      }),
    ),
  );
}
