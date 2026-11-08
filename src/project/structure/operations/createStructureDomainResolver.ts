import { extname, join, matchesGlob } from "node:path";

import { entries, keys, values } from "@auaust/toolkit/object";

import { pathExists } from "#foundation/filesystem/index";
import { listStructureFiles } from "#project/structure/operations/listStructureFiles";
import { constrainsFileRole } from "#project/structure/utils/constrainsFileRole";
import { getStructureCardinality } from "#project/structure/utils/getStructureCardinality";
import { listNamedFileRoles } from "#project/structure/utils/listNamedFileRoles";
import { listStaticFileGlobs } from "#project/structure/utils/listStaticFileGlobs";
import { matchFileRole } from "#project/structure/utils/matchFileRole";
import type { ResolvedRoles } from "#project/structure/types/ResolvedRoles";
import type { StructureEnvironmentName } from "#project/structure/types/StructureEnvironmentName";
import type { StructureOptions } from "#project/structure/types/StructureOptions";
import type { Directory } from "#types/Directory";
import type { File } from "#types/File";

type DomainDeclaration = StructureOptions["domains"][string];

export function createStructureDomainResolver({
  name,
  root,
  options,
  commands,
  indexFile,
  entryFile,
  internals,
  rolesFor,
}: {
  name: StructureEnvironmentName;
  root: Directory;
  options: StructureOptions;
  commands: boolean;
  indexFile: File;
  entryFile: File | undefined;
  internals: boolean;
  rolesFor(scopes: readonly string[]): ResolvedRoles;
}) {
  const { namespaces } = options;
  const domains = entries(options.domains);

  function describe(subpath: string, path: Directory) {
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

    if (namespace !== undefined && exact !== undefined) {
      throw new Error(
        `${path} is declared as a namespace and as a domain in the ${name} environment`,
      );
    }

    return {
      directory,
      namespace,
      exact,
      declared: metadata.length > 0,
      metadata: metadata.reduce<Partial<DomainDeclaration>>(
        (merged, declared) => {
          // @debt a later declaration's resolved `undefined` overrides a value an earlier glob set (`specifier`, `purpose`, `internals`)
          return { ...merged, ...declared };
        },
        {},
      ),
    };
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

    const files =
      commands || fileGlobs.length === 0
        ? []
        : await listStructureFiles(join(root, path));

    const strays = files.filter((file) => {
      return !fileGlobs.some((glob) => matchesGlob(file, glob));
    });

    const owned = listNamedFileRoles(
      keys(contracts),
      (role) => contracts[role],
      undefined,
    ).filter(constrainsFileRole);

    const cardinality = commands
      ? {}
      : getStructureCardinality(
          files.map((file) => {
            return [
              join(path, file),
              matchFileRole(file, {
                named: [],
                enclosing: undefined,
                roles,
              }),
            ] as const;
          }),
          owned,
        );

    const twin = `${path}${extname(indexFile)}`;

    return {
      ...(commands ? { commands: true as const } : {}),
      ...(commands && (await pathExists(join(root, twin))) ? { twin } : {}),
      ...(strays.length === 0
        ? {}
        : { strays: strays.map((file) => join(path, file)) }),
      ...cardinality,
      public:
        entryFile !== undefined &&
        (await pathExists(join(root, path, entryFile))),
      ...(metadata.specifier === undefined
        ? {}
        : { specifier: metadata.specifier }),
      internals: metadata.internals ?? internals,
      ...(metadata.purpose === undefined ? {} : { purpose: metadata.purpose }),
    };
  }

  return { describe, metadataForDomain };
}
