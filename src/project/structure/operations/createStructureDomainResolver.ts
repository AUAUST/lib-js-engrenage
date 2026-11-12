import { basename, extname, join, matchesGlob } from "node:path";

import { entries, keys, values } from "@auaust/toolkit/object";

import {
  defaultReexport,
  domainMetadataFile,
  namespaceMetadataFile,
} from "#project/structure/constants";
import { assignRoleFiles } from "#project/structure/operations/assignRoleFiles";
import { constrainsFileRole } from "#project/structure/utils/constrainsFileRole";
import { getStructureCardinality } from "#project/structure/utils/getStructureCardinality";
import { groupRoleFiles } from "#project/structure/utils/groupRoleFiles";
import { listNamedFileRoles } from "#project/structure/utils/listNamedFileRoles";
import { listReexportModes } from "#project/structure/utils/listReexportModes";
import { listStaticFileGlobs } from "#project/structure/utils/listStaticFileGlobs";
import type { Filesystem } from "#foundation/filesystem/index";
import type { ResolvedRoles } from "#project/structure/types/ResolvedRoles";
import type { StructureOptions } from "#project/structure/types/StructureOptions";
import type { Directory } from "#types/Directory";
import type { File } from "#types/File";

type DomainDeclaration = StructureOptions["domains"][string];

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

    // @debt `assignRoleFiles` computes the same static file globs again; it could return them with its assignments
    const assigned = commands
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

    const cardinality = commands
      ? {}
      : getStructureCardinality(assigned, owned);

    const roleFiles = groupRoleFiles(assigned);

    const twin = `${path}${extname(indexFile)}`;

    return {
      ...(commands ? { commands: true as const } : {}),
      ...(commands && (await filesystem.exists(twin)) ? { twin } : {}),
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
      ...(metadata.purpose === undefined ? {} : { purpose: metadata.purpose }),
    };
  }

  return { describe, metadataForDomain };
}
