import { extname, join, matchesGlob } from "node:path";

import { entries, freeze, keys, values } from "@auaust/toolkit/object";

import {
  defaultReexport,
  domainMetadataFile,
  namespaceMetadataFile,
} from "#project/structure/constants";
import { listStructureFiles } from "#project/structure/operations/listStructureFiles";
import { constrainsFileRole } from "#project/structure/utils/constrainsFileRole";
import { getStructureCardinality } from "#project/structure/utils/getStructureCardinality";
import { listNamedFileRoles } from "#project/structure/utils/listNamedFileRoles";
import { listReexportModes } from "#project/structure/utils/listReexportModes";
import { listStaticFileGlobs } from "#project/structure/utils/listStaticFileGlobs";
import { matchFileRole } from "#project/structure/utils/matchFileRole";
import type { Filesystem } from "#foundation/filesystem/index";
import type { ResolvedRoles } from "#project/structure/types/ResolvedRoles";
import type { StructureOptions } from "#project/structure/types/StructureOptions";
import type { Directory } from "#types/Directory";
import type { File } from "#types/File";

type DomainDeclaration = StructureOptions["domains"][string];

// @debt `getStructureCardinality` groups the same assignments by role again; it could take these groups instead
function groupRoleFiles(
  assigned: readonly (readonly [File, string | undefined])[],
): Readonly<Record<string, readonly File[]>> {
  const grouped: Record<string, File[]> = {};

  for (const [file, role] of assigned) {
    if (role !== undefined) {
      (grouped[role] ??= []).push(file);
    }
  }

  return freeze(grouped);
}

export function createStructureDomainResolver({
  filesystem,
  options,
  commands,
  indexFile,
  entryFile,
  internals,
  rolesFor,
}: {
  filesystem: Filesystem;
  options: StructureOptions;
  commands: boolean;
  indexFile: File;
  entryFile: File | undefined;
  internals: boolean;
  rolesFor(scopes: readonly string[]): ResolvedRoles;
}) {
  const { namespaces } = options;
  const domains = entries(options.domains);

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
      declared: metadata.length > 0,
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
      throw new Error(
        `${entry} exists, but its domain is declared \`public: false\``,
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

    const fileGlobs = values(contracts).flatMap(({ file }) => {
      return listStaticFileGlobs(file);
    });

    const files = commands || fileGlobs.length === 0
      ? []
      : await listStructureFiles(filesystem, path);

    const strays = files.filter((file) => {
      return (
        file !== namespaceMetadataFile &&
        file !== domainMetadataFile &&
        !fileGlobs.some((glob) => matchesGlob(file, glob))
      );
    });

    const owned = listNamedFileRoles(
      keys(contracts),
      (role) => contracts[role],
      undefined,
    ).filter(constrainsFileRole);

    const assigned = files.map((file) => {
      return [
        join(path, file),
        matchFileRole(file, {
          named: [],
          enclosing: undefined,
          roles,
        }),
      ] as const;
    });

    const cardinality = commands
      ? {}
      : getStructureCardinality(assigned, owned);

    const roleFiles = groupRoleFiles(assigned);

    const twin = `${path}${extname(indexFile)}`;

    return {
      ...(commands ? { commands: true as const } : {}),
      ...(commands && (await filesystem.exists(twin)) ? { twin } : {}),
      ...(strays.length === 0
        ? {}
        : { strays: strays.map((file) => join(path, file)) }),
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
      ...(metadata.purpose === undefined ? {} : { purpose: metadata.purpose }),
    };
  }

  return { describe, metadataForDomain };
}
