import { join } from "node:path";

import { memoized } from "@auaust/toolkit/memoized";
import { entries } from "@auaust/toolkit/object";

import { collectStructureNodes } from "#project/structure/utils/collectStructureNodes";
import type { StructureKind } from "#project/structure/types/StructureKind";
import type { StructureMirror } from "#project/structure/types/StructureMirror";
import type { StructureNode } from "#project/structure/types/StructureNode";
import type { StructureParent } from "#project/structure/types/StructureParent";
import type { TestsContext } from "#project/structure/types/TestsContext";
import type { UnclassifiedReason } from "#project/structure/types/UnclassifiedReason";

interface Mirror {
  readonly kind: StructureKind;
  readonly mirror?: StructureMirror;
  readonly reason?: UnclassifiedReason;
  readonly mirrored?: NonNullable<StructureParent["mirrored"]>;
  readonly counterpart?: StructureNode;
}

export function createMirrorClassifier(tests: TestsContext) {
  const counterparts = memoized(
    (environment: string): ReadonlyMap<string, StructureNode> => {
      const structure = tests.environments[environment]?.structure;

      return new Map(
        structure === undefined
          ? []
          : collectStructureNodes(structure.root).map((node) => [
              node.path,
              node,
            ]),
      );
    },
  );

  return function classify(directory: string, parent: StructureParent): Mirror {
    const unknown = {
      kind: "unclassified",
      reason: "unknown root key",
    } as const;

    if (parent.kind === "root") {
      const root = entries(tests.environments).find(
        ([key]) => key === directory,
      );

      return root?.[1] === undefined
        ? unknown
        : {
            kind: "mirror",
            mirror: {
              environment: root[0],
              path: root[1].dirs[0] ?? root[0],
            },
            mirrored: { environment: root[0], subpath: "" },
          };
    }

    if (parent.mirrored === undefined) {
      return unknown;
    }

    const { environment } = parent.mirrored;
    const subpath = join(parent.mirrored.subpath, directory);
    const dirs = tests.environments[environment]?.dirs ?? [];

    const path = tests.mirror
      ? dirs
          .map((dir) => join(dir, subpath))
          .find((candidate) => counterparts(environment).has(candidate))
      : join(dirs[0] ?? environment, subpath);

    const counterpart =
      path === undefined ? undefined : counterparts(environment).get(path);

    return path === undefined
      ? { kind: "unclassified", reason: "missing counterpart" }
      : {
          kind: "mirror",
          mirror: { environment, path },
          mirrored: { environment, subpath },
          ...(counterpart === undefined ? {} : { counterpart }),
        };
  };
}
