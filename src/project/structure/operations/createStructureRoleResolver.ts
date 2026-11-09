import { join } from "node:path";

import { is } from "valibot";

import { wrap } from "@auaust/primitive-kit/arrays";
import { memoized } from "@auaust/toolkit/memoized";
import { freeze, record } from "@auaust/toolkit/object";

import {
  roleFileResolverSchema,
  type RoleLocation,
} from "#project/roles/index";
import { noRoles } from "#project/structure/constants";
import { listStructureFiles } from "#project/structure/operations/listStructureFiles";
import { listStructureFilesAtAnyDepth } from "#project/structure/operations/listStructureFilesAtAnyDepth";
import { constrainsFileRole } from "#project/structure/utils/constrainsFileRole";
import { getLocalRoleName } from "#project/structure/utils/getLocalRoleName";
import { getStructureCardinality } from "#project/structure/utils/getStructureCardinality";
import { listNamedFileRoles } from "#project/structure/utils/listNamedFileRoles";
import { matchFileRole } from "#project/structure/utils/matchFileRole";
import { resolveRoles } from "#project/structure/utils/resolveRoles";
import type { EnvironmentRoles } from "#project/structure/types/EnvironmentRoles";
import type { ResolvedRoles } from "#project/structure/types/ResolvedRoles";
import type { RoleRegistry } from "#project/structure/types/RoleRegistry";
import type { StructureNode } from "#project/structure/types/StructureNode";
import type { StructureParent } from "#project/structure/types/StructureParent";
import type { Directory } from "#types/Directory";
import type { Glob } from "#types/Glob";

const anyFile: Glob = "**";

export function createStructureRoleResolver({
  name,
  root,
  roles,
  defined,
}: {
  name: string;
  root: Directory;
  roles: EnvironmentRoles | undefined;
  defined: RoleRegistry | undefined;
}) {
  const rolesFor = memoized(
    (scopes: readonly string[]): ResolvedRoles => {
      return roles === undefined
        ? noRoles
        : resolveRoles({
            ...roles,
            environment: name,
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
    const purpose = rolesFor(scopes).roles[role]?.purpose;

    const effects = rolesFor(scopes).roles[role]?.effects;

    return {
      ...(purpose === undefined ? {} : { purpose }),
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

      return is(roleFileResolverSchema, file)
        ? [[nested, freeze(wrap(file(location)))] as const]
        : [];
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

    const directory = join(root, path);

    const files = structured
      ? await listStructureFiles(directory)
      : await listStructureFilesAtAnyDepth(directory);

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
