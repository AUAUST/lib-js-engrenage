import { basename, extname } from "node:path";

import { entries, freeze, getOwn, record } from "@auaust/toolkit/object";

import { entryRoleName } from "#batiment/roles/constants";
import { getRootEntryFile } from "#batiment/structure/utils/getRootEntryFile";
import { isPlaced } from "#batiment/structure/utils/isPlaced";
import type { StructureDiagnostic } from "#batiment/report/index";
import type { NamespaceFileNames } from "#batiment/structure/types/NamespaceFileNames";
import type { NamespaceStructure } from "#batiment/structure/types/NamespaceStructure";
import type { StructureNode } from "#batiment/structure/types/StructureNode";
import type { StructureRole } from "#batiment/structure/types/StructureRole";
import type { File } from "#types/File";

const subpathPrefix = "./";
const internalsSubpath = "internals";

function toSubpath(segments: readonly string[], node: StructureNode): string {
  const declared = node.specifier;

  if (declared === undefined) {
    return `${subpathPrefix}${segments.join("/")}`;
  }

  return declared.startsWith(subpathPrefix)
    ? declared
    : `${subpathPrefix}${declared}`;
}

type Roles = Readonly<Record<string, StructureRole>>;

function collectRoleSubpaths(
  subpath: string,
  node: StructureNode,
  roles: Roles,
): (readonly [string, File])[] {
  return entries(node.roleFiles ?? {}).flatMap(([role, files]) => {
    const contract = getOwn(roles, role)?.contract;

    if (
      contract === undefined ||
      !isPlaced(contract.subpath, subpath === ".")
    ) {
      return [];
    }

    return files.map((file) => {
      return [`${subpath}/${basename(file, extname(file))}`, file] as const;
    });
  });
}

function collectRoleBarrels(
  subpath: string,
  node: StructureNode,
  files: NamespaceFileNames,
  roles: Roles,
): (readonly [string, File])[] {
  return node.children.flatMap((child) => {
    const contract = child.kind === "role" && child.role !== undefined
      ? getOwn(roles, child.role)?.contract
      : undefined;

    const atRoot = subpath === ".";

    if (
      contract === undefined ||
      !isPlaced(contract.index, atRoot) ||
      !isPlaced(contract.subpath, atRoot)
    ) {
      return [];
    }

    return [
      [`${subpath}/${child.name}`, `${child.path}/${files.indexFile}`] as const,
    ];
  });
}

function collectEntries(
  node: StructureNode,
  segments: readonly string[],
  files: NamespaceFileNames,
  roles: Roles,
): (readonly [string, File])[] {
  return node.children.flatMap((child) => {
    if (child.kind === "namespace") {
      return collectEntries(child, segments, files, roles);
    }

    if (child.kind !== "domain") {
      return [];
    }

    const path = [...segments, child.name];
    const subpath = toSubpath(path, child);

    return [
      ...(child.public === true && files.entryFile !== undefined
        ? [
            [subpath, `${child.path}/${files.entryFile}`] as const,
            ...collectRoleSubpaths(subpath, child, roles),
            ...collectRoleBarrels(subpath, child, files, roles),
          ]
        : []),
      ...(child.internals === true
        ? [
            [
              `${subpath}/${internalsSubpath}`,
              `${child.path}/${files.indexFile}`,
            ] as const,
          ]
        : []),
      ...collectEntries(child, path, files, roles),
    ];
  });
}

export function resolveDomainEntries(
  structure: Omit<NamespaceStructure, "entries" | "unreached" | "diagnostics">,
): {
  readonly entries: Readonly<Record<string, File>>;
  readonly diagnostics: readonly StructureDiagnostic[];
} {
  const found = new Map<string, File>();
  const diagnostics: StructureDiagnostic[] = [];

  const { root, roles } = structure;

  const rootEntry = getRootEntryFile(structure);

  const rootEntries = getOwn(root.roleFiles ?? {}, entryRoleName) ?? [];

  for (const [subpath, file] of [
    ...rootEntries
      .filter((file) => file === rootEntry)
      .map((file) => [".", file] as const),
    ...collectRoleSubpaths(".", root, roles),
    ...collectRoleBarrels(".", root, structure, roles),
    ...collectEntries(root, [], structure, roles),
  ]) {
    const previous = found.get(subpath);

    if (previous !== undefined) {
      diagnostics.push(
        freeze({
          severity: "error",
          code: "shared-specifier",
          message: `${previous} and ${file} share the specifier '${subpath}': declare a distinct 'specifier' on the domain of one of them; keeping ${previous}`,
          blocking: true,
          namespace: structure.name,
          files: freeze([previous, file]),
        }),
      );

      continue;
    }

    found.set(subpath, file);
  }

  return freeze({
    entries: freeze(record([...found])),
    diagnostics: freeze(diagnostics),
  });
}
