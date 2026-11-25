import { matchesGlob, posix } from "node:path";

import { hasOwn, keys } from "@auaust/toolkit/object";

import { collectStructureNodes } from "#batiment/structure/utils/collectStructureNodes";
import type { DeclaredStructure } from "#batiment/structure/types/DeclaredStructure";
import type { NamespaceStructure } from "#batiment/structure/types/NamespaceStructure";
import type { StructureMetadata } from "#batiment/structure/types/StructureMetadata";
import type { StructureNode } from "#batiment/structure/types/StructureNode";
import type { StructureOptions } from "#batiment/structure/types/StructureOptions";
import type { Directory } from "#types/Directory";

type Unreached = NamespaceStructure["unreached"][number];

interface DirectoryDeclarations {
  readonly directory: Directory;
  readonly node: StructureNode;
  readonly declared: DeclaredStructure;
  readonly merged: Pick<StructureOptions, "namespaces" | "domains">;
  readonly metadata: readonly StructureMetadata[];
}

function listUnreachedIn({
  directory,
  node,
  declared,
  merged,
  metadata,
}: DirectoryDeclarations): Unreached[] {
  const subpaths = collectStructureNodes(node)
    .map((each) => {
      return { subpath: posix.relative(directory, each.path), kind: each.kind };
    })
    .filter(({ subpath }) => {
      return subpath !== ".." && !subpath.startsWith("../");
    })
    .map(({ subpath, kind }) => {
      return { subpath: subpath === "" ? "." : subpath, kind };
    });

  const reached = new Set([".", ...subpaths.map(({ subpath }) => subpath)]);

  const domainSubpaths = subpaths
    .filter(({ kind }) => kind === "domain")
    .map(({ subpath }) => subpath);

  function entry(path: string, kind: "namespace" | "domain"): Unreached {
    return {
      path,
      kind,
      config: hasOwn(
        kind === "namespace" ? declared.namespaces : declared.domains,
        path,
      ),
      files: metadata.find((located) => located.path === path)?.files ?? [],
    };
  }

  return [
    ...keys(merged.namespaces)
      .filter((path) => !reached.has(path))
      .map((path) => entry(path, "namespace")),
    ...keys(merged.domains)
      .filter((path) => {
        return (
          !reached.has(path) &&
          !domainSubpaths.some((subpath) => matchesGlob(subpath, path))
        );
      })
      .map((path) => entry(path, "domain")),
  ];
}

export function listUnreachedDeclarations(
  directories: readonly DirectoryDeclarations[],
): NamespaceStructure["unreached"] {
  const found = new Map<string, { entry: Unreached; count: number }>();

  for (const unreached of directories.flatMap(listUnreachedIn)) {
    const key = `${unreached.kind}:${unreached.path}`;
    const previous = found.get(key);

    found.set(key, {
      entry: previous === undefined
        ? unreached
        : {
            ...previous.entry,
            files: [...previous.entry.files, ...unreached.files],
          },
      count: (previous?.count ?? 0) + 1,
    });
  }

  return [...found.values()]
    .filter(({ entry, count }) => {
      return !entry.config || count === directories.length;
    })
    .map(({ entry }) => entry)
    .sort((left, right) => left.path.localeCompare(right.path));
}
