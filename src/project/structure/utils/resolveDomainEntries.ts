import { record } from "@auaust/toolkit/object";

import type { EnvironmentStructure } from "#project/structure/types/EnvironmentStructure";
import type { StructureNode } from "#project/structure/types/StructureNode";
import type { File } from "#types/File";

const indexFile = "index.ts";
const subpathPrefix = "./";

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
): (readonly [string, File])[] {
  return node.children.flatMap((child) => {
    if (child.kind === "namespace") {
      return collectEntries(child, segments);
    }

    if (child.kind !== "domain") {
      return [];
    }

    const path = [...segments, child.name];

    return [
      ...(child.public === true
        ? [[toSubpath(path, child), `${child.path}/${indexFile}`] as const]
        : []),
      ...collectEntries(child, path),
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

  for (const [subpath, file] of collectEntries(structure.root, [])) {
    const previous = found.get(subpath);

    if (previous !== undefined) {
      throw new Error(
        `Public domains ${previous} and ${file} share the specifier '${subpath}': declare a distinct 'specifier' on one of them`,
      );
    }

    found.set(subpath, file);
  }

  return record([...found]);
}
