import { join, posix } from "node:path";

import { memoize } from "@auaust/toolkit/function";

import { collectStructureNodes } from "#batiment/structure/utils/collectStructureNodes";
import { listMirrorRoots } from "#batiment/structure/utils/listMirrorRoots";
import type { StructureKind } from "#batiment/structure/types/StructureKind";
import type { StructureMirror } from "#batiment/structure/types/StructureMirror";
import type { StructureNode } from "#batiment/structure/types/StructureNode";
import type { StructureParent } from "#batiment/structure/types/StructureParent";
import type { TestsContext } from "#batiment/structure/types/TestsContext";
import type { UnclassifiedReason } from "#batiment/structure/types/UnclassifiedReason";

interface Mirror {
  readonly kind: StructureKind;
  readonly mirror?: StructureMirror;
  readonly reason?: UnclassifiedReason;
  readonly mirrored?: NonNullable<StructureParent["mirrored"]>;
  readonly counterpart?: StructureNode;
}

export function createMirrorClassifier(tests: TestsContext) {
  const counterparts = memoize(
    (namespace: string): ReadonlyMap<string, StructureNode> => {
      const structure = tests.namespaces[namespace]?.structure;

      return new Map(
        structure === undefined
          ? []
          : collectStructureNodes(structure.root).map((node) => {
              return [node.path, node];
            }),
      );
    },
  );

  const roots = Map.groupBy(listMirrorRoots(tests), ({ key }) => key);
  const rootKeys = [...roots.keys()];

  // @debt a directory between a root key and a nested directory name mirrors its path without a counterpart, accepting tests placed in it, and a root key naming no directory never reaches a nested directory name below it (`lib` and `src/web/legacy` leave `tests/src` unknown)
  function isAboveRoot(key: string): boolean {
    return rootKeys.some((rootKey) => rootKey.startsWith(`${key}/`));
  }

  return function classify(directory: string, parent: StructureParent): Mirror {
    const unknown = {
      kind: "unclassified",
      reason: "unknown root key",
    } as const;

    const { mirrored } = parent;

    const key = parent.kind === "root"
      ? directory
      : mirrored === undefined
        ? undefined
        : posix.join(mirrored.key, directory);

    const [root] = key === undefined ? [] : (roots.get(key) ?? []);

    if (root !== undefined) {
      return {
        kind: "mirror",
        mirror: {
          namespace: root.namespace,
          path: root.dirs[0] ?? root.namespace,
        },
        mirrored: {
          ...root,
          subpath: "",
        },
      };
    }

    if (key === undefined || mirrored === undefined) {
      return unknown;
    }

    const { namespace, dirs } = mirrored;
    const subpath = join(mirrored.subpath, directory);
    const fallback = join(dirs[0] ?? namespace, subpath);

    const found = tests.mirror
      ? dirs
          .map((dir) => join(dir, subpath))
          .find((candidate) => counterparts(namespace).has(candidate))
      : fallback;

    const path = found ?? (isAboveRoot(key) ? fallback : undefined);

    const counterpart = found === undefined
      ? undefined
      : counterparts(namespace).get(found);

    return path === undefined
      ? { kind: "unclassified", reason: "missing counterpart" }
      : {
          kind: "mirror",
          mirror: {
            namespace,
            path,
          },
          mirrored: {
            namespace,
            key,
            dirs,
            subpath,
          },
          ...(counterpart === undefined ? {} : { counterpart }),
        };
  };
}
