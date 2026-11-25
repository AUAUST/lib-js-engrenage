import { basename, extname, join, matchesGlob } from "node:path";

import { entries, freeze, hasOwn, keys, values } from "@auaust/toolkit/object";

import { assignRoleFiles } from "#batiment/context/operations/assignRoleFiles";
import {
  listReexportModes,
  listStaticFileGlobs,
  type ResolvedRoles,
} from "#batiment/roles/index";
import {
  domainMetadataFile,
  namespaceMetadataFile,
} from "#batiment/scopes/constants";
import { defaultReexport } from "#batiment/structure/constants";
import {
  constrainsFileRole,
  getStructureCardinality,
  groupRoleFiles,
  listNamedFileRoles,
  type StructureOptions,
} from "#batiment/structure/index";
import type { StructureDiagnostic } from "#batiment/report/index";
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
  indexFile,
  entryFile,
  internals,
  rolesFor,
  report,
}: {
  name: string;
  filesystem: Filesystem;
  options: StructureOptions;
  group: boolean;
  indexFile: File;
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
            ...(declared.purpose === undefined
              ? {}
              : { purpose: declared.purpose }),
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

    // @debt builds its diagnostic like `collected-role-not-public` in `resolveNamespaceStructure`; a helper reporting a dropped role option with its source would serve both
    for (const role of unknown) {
      const source = metadata.sources?.publicRoles;

      report(
        freeze({
          severity: "error",
          code: "unknown-public-role",
          message: `${path} lists ${role} in its publicRoles, but ${name} has no such role there; dropping it`,
          blocking: true,
          namespace: name,
          files: freeze([...(source?.files ?? [])]),
          ...(source?.config === undefined ? {} : { config: source.config }),
        }),
      );
    }

    const publicRoles = (metadata.publicRoles ?? []).filter((role) => {
      return !unknown.includes(role);
    });

    const fileGlobs = values(contracts).flatMap(({ file }) => {
      return listStaticFileGlobs(file);
    });

    // @debt `assignRoleFiles` computes the same static file globs again; it could return them with its assignments
    const assigned = group
      ? []
      : await assignRoleFiles(filesystem, path, roles);

    const strays = assigned
      .map(([file]) => file)
      .filter((file) => {
        const name = basename(file);

        return (
          name !== namespaceMetadataFile &&
          name !== domainMetadataFile &&
          !fileGlobs.some((glob) => matchesGlob(name, glob))
        );
      });

    const owned = listNamedFileRoles(
      keys(contracts),
      (role) => contracts[role],
      undefined,
    ).filter(constrainsFileRole);

    const cardinality = group ? {} : getStructureCardinality(assigned, owned);

    const roleFiles = groupRoleFiles(assigned);

    const twin = `${path}${extname(indexFile)}`;

    return {
      ...(group ? { group: true as const } : {}),
      ...(group && (await filesystem.exists(twin)) ? { twin } : {}),
      ...(strays.length === 0 ? {} : { strays }),
      ...cardinality,
      ...(keys(roleFiles).length === 0 ? {} : { roleFiles }),
      public: await resolvePublic(path, metadata.public),
      ...(metadata.specifier === undefined
        ? {}
        : { specifier: metadata.specifier }),
      internals: metadata.internals ?? internals,
      reexport: listReexportModes(metadata.reexport ?? defaultReexport),
      ...(metadata.collects === undefined
        ? {}
        : { collects: metadata.collects }),
      ...(publicRoles.length === 0 ? {} : { publicRoles }),
      ...(metadata.purpose === undefined ? {} : { purpose: metadata.purpose }),
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
