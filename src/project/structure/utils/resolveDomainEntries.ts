import { basename, extname } from "node:path";

import { entries, getOwn, record } from "@auaust/toolkit/object";

import type { EnvironmentFileNames } from "#project/structure/types/EnvironmentFileNames";
import type { EnvironmentStructure } from "#project/structure/types/EnvironmentStructure";
import type { StructureNode } from "#project/structure/types/StructureNode";
import type { StructureRole } from "#project/structure/types/StructureRole";
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
    if (getOwn(roles, role)?.contract.subpath !== true) {
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
  files: EnvironmentFileNames,
  roles: Roles,
): (readonly [string, File])[] {
  return node.children.flatMap((child) => {
    const contract = child.kind === "role" && child.role !== undefined
      ? getOwn(roles, child.role)?.contract
      : undefined;

    if (contract?.index !== true || !contract.subpath) {
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
  files: EnvironmentFileNames,
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
  structure: EnvironmentStructure | undefined,
): Record<string, File> {
  if (structure === undefined) {
    return {};
  }

  const found = new Map<string, File>();

  const { root, roles } = structure;

  for (const [subpath, file] of [
    ...collectRoleBarrels(".", root, structure, roles),
    ...collectEntries(root, [], structure, roles),
  ]) {
    const previous = found.get(subpath);

    if (previous !== undefined) {
      throw new Error(
        `${previous} and ${file} share the specifier '${subpath}': declare a distinct 'specifier' on the domain of one of them`,
      );
    }

    found.set(subpath, file);
  }

  return record([...found]);
}
