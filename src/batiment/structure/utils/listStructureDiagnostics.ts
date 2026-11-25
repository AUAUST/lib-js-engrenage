import { flatMap } from "@auaust/toolkit/array";

import { collectStructureNodes } from "#batiment/structure/utils/collectStructureNodes";
import { listSharedPathDiagnostics } from "#batiment/structure/utils/listSharedPathDiagnostics";
import { renderCardinalityViolation } from "#batiment/structure/utils/renderCardinalityViolation";
import { renderCommandGroupTwin } from "#batiment/structure/utils/renderCommandGroupTwin";
import type { StructureDiagnostic } from "#batiment/report/index";
import type { NamespaceStructure } from "#batiment/structure/types/NamespaceStructure";
import type { StructureNode } from "#batiment/structure/types/StructureNode";

function listNodeErrors(
  node: StructureNode,
  namespace: Omit<NamespaceStructure, "diagnostics">,
): StructureDiagnostic[] {
  const located = {
    severity: "error",
    namespace: namespace.name,
    path: node.path,
  } as const;

  return [
    ...(namespace.strictness === "strict" && node.kind === "unclassified"
      ? [
          {
            ...located,
            code: "unclassified" as const,
            message: node.reason === undefined
              ? "unclassified"
              : `unclassified (${node.reason})`,
            files: [],
          },
        ]
      : []),
    ...(node.cardinality ?? []).map((violation) => {
      return {
        ...located,
        code: "cardinality" as const,
        message: renderCardinalityViolation(violation),
        files: violation.files,
      };
    }),
    ...(node.twin === undefined
      ? []
      : [
          {
            ...located,
            code: "twin" as const,
            message: renderCommandGroupTwin({
              path: node.path,
              twin: node.twin,
            }),
            files: [node.twin],
          },
        ]),
  ];
}

export function listStructureDiagnostics(
  namespace: Omit<NamespaceStructure, "diagnostics">,
): StructureDiagnostic[] {
  const nodes = collectStructureNodes(namespace.root);

  return [
    ...flatMap(nodes, (node) => listNodeErrors(node, namespace)),
    ...listSharedPathDiagnostics(namespace),
    ...namespace.unreached.map(({ path, kind, config, files }) => {
      const sources = [...(config ? ["the config"] : []), ...files];

      return {
        severity: "error" as const,
        code: "unreached" as const,
        message: `unreached ${kind}, declared by ${sources.join(", ")}`,
        namespace: namespace.name,
        path,
        files,
      };
    }),
    ...nodes
      .filter((node) => {
        return (
          (node.kind === "domain" || node === namespace.root) &&
          node.purpose === undefined
        );
      })
      .map((node) => {
        const root = node === namespace.root;

        return {
          severity: "warning" as const,
          code: "missing-purpose" as const,
          message: root
            ? "has no purpose: set one on its environment's `structure`."
            : "has no purpose: set one on its `domains` entry.",
          namespace: namespace.name,
          path: root ? (namespace.dirs[0] ?? namespace.name) : node.path,
          files: [],
        };
      }),
  ];
}
