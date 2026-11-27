import { join, matchesGlob } from "node:path";

import { entries, freeze, hasOwn, keys } from "@auaust/toolkit/object";

import { assignRoleFiles } from "#batiment/context/operations/assignRoleFiles";
import { listReexportModes, type ResolvedRoles } from "#batiment/roles/index";
import { defaultReexport } from "#batiment/structure/constants";
import {
  constrainsFileRole,
  getStructureCardinality,
  groupRoleFiles,
  listNamedFileRoles,
  listStrayFiles,
  type StructureNode,
  type StructureOptions,
} from "#batiment/structure/index";
import type {
  StructureDiagnostic,
  StructureDiagnosticCode,
} from "#batiment/report/index";
import type { Filesystem } from "#foundation/filesystem/index";
import type { Directory } from "#types/Directory";
import type { File } from "#types/File";

type DomainDeclaration = StructureOptions["domains"][string];

type FieldSources = DomainDeclaration["sources"];

export function createStructureDomainResolver({
  name,
  filesystem,
  options,
  group,
  entryFile,
  internals,
  rolesFor,
  report,
}: {
  name: string;
  filesystem: Filesystem;
  options: StructureOptions;
  group: boolean;
  entryFile: File | undefined;
  internals: boolean;
  rolesFor(scopes: readonly string[]): ResolvedRoles;
  report(diagnostic: StructureDiagnostic): void;
}) {
  const { namespaces } = options;
  const domains = entries(options.domains);
  const fieldSources = new Map<Directory, FieldSources>();

  function describe(subpath: string) {
    const directory = subpath.slice(subpath.lastIndexOf("/") + 1);
    const namespace = namespaces[subpath];
    const exact = domains.find(([glob]) => glob === subpath)?.[1];

    const metadata: DomainDeclaration[] = [
      ...domains
        .filter(([glob]) => {
          return glob !== subpath && matchesGlob(subpath, glob);
        })
        .map(([, declared]) => declared),
      ...(exact === undefined ? [] : [exact]),
    ];

    return {
      directory,
      namespace,
      exact,
      declared: metadata.at(-1)?.source,
      metadata: metadata.reduce<Partial<DomainDeclaration>>(
        (merged, declared) => {
          return {
            ...merged,
            ...(declared.specifier === undefined
              ? {}
              : { specifier: declared.specifier }),
            ...(declared.exports === undefined
              ? {}
              : { exports: declared.exports }),
            ...(declared.purpose === undefined
              ? {}
              : { purpose: declared.purpose }),
            ...(declared.debt === undefined ? {} : { debt: declared.debt }),
            ...(declared.internals === undefined
              ? {}
              : { internals: declared.internals }),
            ...(declared.reexport === undefined
              ? {}
              : { reexport: declared.reexport }),
            ...(declared.collects === undefined
              ? {}
              : { collects: declared.collects }),
            ...(declared.publicRoles === undefined
              ? {}
              : { publicRoles: declared.publicRoles }),
            sources: { ...merged.sources, ...declared.sources },
            ...(declared.public === undefined
              ? {}
              : { public: declared.public }),
          };
        },
        {},
      ),
    };
  }

  async function resolvePublic(
    path: Directory,
    declared: boolean | undefined,
  ): Promise<boolean> {
    const entry = entryFile === undefined ? undefined : join(path, entryFile);

    const exists = entry !== undefined && (await filesystem.exists(entry));

    if (declared === false && exists) {
      report(
        freeze({
          severity: "error",
          code: "private-domain-entry",
          message: `${entry} exists, but its domain is declared \`public: false\`; keeping \`public: false\``,
          blocking: true,
          namespace: name,
          files: freeze([entry]),
        }),
      );
    }

    return declared ?? exists;
  }

  // @debt builds its diagnostic like `collected-role-not-public` in `resolveNamespaceStructure`; one helper reporting a dropped option with its source would serve both
  function reportDroppedField(
    code: StructureDiagnosticCode,
    message: string,
    source: FieldSources[keyof FieldSources],
  ) {
    report(
      freeze({
        severity: "error",
        code,
        message,
        blocking: true,
        namespace: name,
        files: freeze([...(source?.files ?? [])]),
        ...(source?.config === undefined ? {} : { config: source.config }),
      }),
    );
  }

  function resolveExports(
    path: Directory,
    isPublic: boolean,
    metadata: Partial<DomainDeclaration>,
  ): Pick<StructureNode, "exports"> {
    if (metadata.exports === undefined) {
      return {};
    }

    if (isPublic) {
      return { exports: metadata.exports };
    }

    reportDroppedField(
      "private-domain-exports",
      `${path} declares exports, but only a public domain has a specifier to scope them under; dropping them`,
      metadata.sources?.exports,
    );

    return {};
  }

  async function metadataForDomain(
    path: Directory,
    scopes: readonly string[],
    metadata: Partial<DomainDeclaration>,
  ) {
    const roles = rolesFor(scopes);
    const { roles: contracts } = roles;

    if (metadata.sources !== undefined) {
      fieldSources.set(path, metadata.sources);
    }

    const unknown = (metadata.publicRoles ?? []).filter((role) => {
      return !hasOwn(contracts, role);
    });

    for (const role of unknown) {
      reportDroppedField(
        "unknown-public-role",
        `${path} lists ${role} in its publicRoles, but ${name} has no such role there; dropping it`,
        metadata.sources?.publicRoles,
      );
    }

    const publicRoles = (metadata.publicRoles ?? []).filter((role) => {
      return !unknown.includes(role);
    });

    const assigned = group
      ? []
      : await assignRoleFiles(filesystem, path, roles);

    const strays = listStrayFiles(assigned);

    const owned = listNamedFileRoles(
      keys(contracts),
      (role) => contracts[role],
      undefined,
    ).filter(constrainsFileRole);

    const cardinality = group ? {} : getStructureCardinality(assigned, owned);

    const roleFiles = groupRoleFiles(assigned);

    const isPublic = await resolvePublic(path, metadata.public);

    return {
      ...(group ? { group: true as const } : {}),
      ...(strays.length === 0 ? {} : { strays }),
      ...cardinality,
      ...(keys(roleFiles).length === 0 ? {} : { roleFiles }),
      public: isPublic,
      ...(metadata.specifier === undefined
        ? {}
        : { specifier: metadata.specifier }),
      ...resolveExports(path, isPublic, metadata),
      internals: metadata.internals ?? internals,
      reexport: listReexportModes(metadata.reexport ?? defaultReexport),
      ...(metadata.collects === undefined
        ? {}
        : { collects: metadata.collects }),
      ...(publicRoles.length === 0 ? {} : { publicRoles }),
      ...(metadata.purpose === undefined ? {} : { purpose: metadata.purpose }),
      ...(metadata.debt === undefined ? {} : { debt: metadata.debt }),
    };
  }

  function collectsSourceOf(
    path: Directory,
  ): FieldSources["collects"] | undefined {
    return fieldSources.get(path)?.collects;
  }

  return {
    describe,
    metadataForDomain,
    collectsSourceOf,
  };
}
