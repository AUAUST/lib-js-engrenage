import { posix } from "node:path";

import { freeze } from "@auaust/toolkit/object";

import { collectStructureNodes } from "#batiment/structure/utils/collectStructureNodes";
import { listNamespaceDirectories } from "#batiment/structure/utils/listNamespaceDirectories";
import type { StructureDiagnostic } from "#batiment/report/index";
import type { NamespaceStructure } from "#batiment/structure/types/NamespaceStructure";

export function listSharedPathDiagnostics(
  namespace: Pick<NamespaceStructure, "name" | "dirs" | "root">,
): readonly StructureDiagnostic[] {
  const held = listNamespaceDirectories(namespace).flatMap(({ node }) => {
    return collectStructureNodes(node)
      .filter(({ kind }) => {
        return kind === "domain" || kind === "namespace";
      })
      .map((each) => {
        return { path: posix.relative(node.path, each.path), node: each };
      });
  });

  const shared = [...Map.groupBy(held, ({ path }) => path)].filter(
    ([, holders]) => holders.length > 1,
  );

  const sharedPaths = new Set(shared.map(([path]) => path));

  function isBelowShared(path: string): boolean {
    const parent = posix.dirname(path);

    return parent !== "." && (sharedPaths.has(parent) || isBelowShared(parent));
  }

  return freeze(
    shared
      .filter(([path]) => !isBelowShared(path))
      .map(([path, holders]) => {
        const files = holders.map(({ node }) => node.path);

        return freeze({
          severity: "error" as const,
          code: "shared-structure-path" as const,
          message: `${files.join(" and ")} hold the same path ${path} in several directories of the ${namespace.name} namespace, which each own what they hold: rename or move all but one`,
          blocking: true as const,
          namespace: namespace.name,
          path: files[0],
          files: freeze(files),
        });
      }),
  );
}
