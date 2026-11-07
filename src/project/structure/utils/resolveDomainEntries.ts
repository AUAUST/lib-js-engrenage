import { record } from "@auaust/toolkit/object";

import type { EnvironmentFileNames } from "#project/structure/types/EnvironmentFileNames";
import type { EnvironmentStructure } from "#project/structure/types/EnvironmentStructure";
import type { StructureNode } from "#project/structure/types/StructureNode";
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

function collectEntries(
  node: StructureNode,
  segments: readonly string[],
  files: EnvironmentFileNames,
): (readonly [string, File])[] {
  return node.children.flatMap((child) => {
    if (child.kind === "namespace") {
      return collectEntries(child, segments, files);
    }

    if (child.kind !== "domain") {
      return [];
    }

    const path = [...segments, child.name];
    const subpath = toSubpath(path, child);

    return [
      ...(child.public === true && files.entryFile !== undefined
        ? [[subpath, `${child.path}/${files.entryFile}`] as const]
        : []),
      ...(child.internals === true
        ? [
            [
              `${subpath}/${internalsSubpath}`,
              `${child.path}/${files.indexFile}`,
            ] as const,
          ]
        : []),
      ...collectEntries(child, path, files),
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

  for (const [subpath, file] of collectEntries(structure.root, [], structure)) {
    const previous = found.get(subpath);

    if (previous !== undefined) {
      throw new Error(
        `Domains ${previous} and ${file} share the specifier '${subpath}': declare a distinct 'specifier' on one of them`,
      );
    }

    found.set(subpath, file);
  }

  return record([...found]);
}
