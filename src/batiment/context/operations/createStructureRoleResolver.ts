import { join } from "node:path";

import { memoize } from "@auaust/toolkit/function";
import { freeze, record } from "@auaust/toolkit/object";

import { listStructureFiles } from "#batiment/context/operations/listStructureFiles";
import { listStructureFilesAtAnyDepth } from "#batiment/context/operations/listStructureFilesAtAnyDepth";
import { noRoles } from "#batiment/roles/constants";
import {
  fillRolePlaceholders,
  isLocatedRoleFile,
  resolveRoles,
  type NamespaceRoles,
  type ResolvedRoles,
  type RoleLocation,
  type RoleRegistry,
} from "#batiment/roles/index";
import {
  constrainsFileRole,
  getLocalRoleName,
  getStructureCardinality,
  listNamedFileRoles,
  matchFileRole,
  type StructureNode,
  type StructureParent,
} from "#batiment/structure/index";
import type { Filesystem } from "#foundation/filesystem/index";
import type { Directory } from "#types/Directory";
import type { Glob } from "#types/Glob";

const anyFile: Glob = "**";

export function createStructureRoleResolver({
  name,
  filesystem,
  roles,
  defined,
}: {
  name: string;
  filesystem: Filesystem;
  roles: NamespaceRoles | undefined;
  defined: RoleRegistry | undefined;
}) {
  const rolesFor = memoize(
    (scopes: readonly string[]): ResolvedRoles => {
      return roles === undefined
        ? noRoles
        : resolveRoles({
            ...roles,
            namespace: name,
            ...(defined === undefined ? {} : { defined }),
            scopes,
          });
    },
    (scopes) => scopes.join("\0"),
  );

  function roleOf(
    directory: string,
    parent: StructureParent,
  ): string | undefined {
    const { roles: contracts, aliases } = rolesFor(parent.scopes);
    const local = aliases[directory] ?? directory;

    const role = [
      ...parent.owned.filter((owned) => getLocalRoleName(owned) === local),
      local,
    ].find((candidate) => contracts[candidate] !== undefined);

    return role !== undefined && contracts[role]?.file === undefined
      ? role
      : undefined;
  }

  function metadataOf(role: string, scopes: readonly string[]) {
    const { purpose, debt, effects } = rolesFor(scopes).roles[role] ?? {};

    return {
      ...(purpose === undefined ? {} : { purpose }),
      ...(debt === undefined ? {} : { debt }),
      ...(effects === undefined ? {} : { effects }),
    };
  }

  function resolveFileNames(
    owner: string,
    scopes: readonly string[],
    location: RoleLocation,
  ): Pick<StructureNode, "fileNames"> {
    const { roles: contracts } = rolesFor(scopes);

    const resolved = (contracts[owner]?.roles ?? []).flatMap((nested) => {
      const file = contracts[nested]?.file;

      return file === undefined || !isLocatedRoleFile(file)
        ? []
        : [[nested, freeze(fillRolePlaceholders(file, location))] as const];
    });

    return resolved.length === 0 ? {} : { fileNames: freeze(record(resolved)) };
  }

  async function roleCardinality(
    path: Directory,
    role: string,
    {
      scopes,
      structured,
      fileNames,
    }: {
      scopes: readonly string[];
      structured: boolean;
      fileNames?: StructureNode["fileNames"];
    },
  ): Promise<Pick<StructureNode, "cardinality">> {
    const roles = rolesFor(scopes);
    const contract = roles.roles[role];

    if (contract === undefined) {
      return {};
    }

    const named = structured
      ? listNamedFileRoles(
          contract.roles ?? [],
          (name) => roles.roles[name],
          fileNames,
        )
      : [];

    // @debt the directory role passes as a `NamedFileRole` matching any file; a location-constraint type naming file and directory roles alike would state it
    const owned = [
      ...named,
      {
        name: role,
        contract,
        globs: [anyFile],
      },
    ].filter(constrainsFileRole);

    if (owned.length === 0) {
      return {};
    }

    const files = structured
      ? await listStructureFiles(filesystem, path)
      : await listStructureFilesAtAnyDepth(filesystem, path);

    return getStructureCardinality(
      files.map((file) => {
        return [
          join(path, file),
          matchFileRole(file, {
            named,
            enclosing: role,
            roles,
          }),
        ] as const;
      }),
      owned,
    );
  }

  return {
    rolesFor,
    roleOf,
    metadataOf,
    resolveFileNames,
    roleCardinality,
  };
}
