import { flatMap } from "@auaust/toolkit/array";

import { collectStructureNodes } from "#batiment/structure/utils/collectStructureNodes";
import { renderCardinalityViolation } from "#batiment/structure/utils/renderCardinalityViolation";
import { renderCommandGroupTwin } from "#batiment/structure/utils/renderCommandGroupTwin";
import type { StructureDiagnostic } from "#batiment/report/index";
import type { EnvironmentStructure } from "#batiment/structure/types/EnvironmentStructure";
import type { StructureNode } from "#batiment/structure/types/StructureNode";

function listNodeErrors(
  node: StructureNode,
  environment: Omit<EnvironmentStructure, "diagnostics">,
): StructureDiagnostic[] {
  const located = {
    severity: "error",
    environment: environment.name,
    path: node.path,
  } as const;

  return [
    ...(environment.strictness === "strict" && node.kind === "unclassified"
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
  environment: Omit<EnvironmentStructure, "diagnostics">,
): StructureDiagnostic[] {
  const nodes = collectStructureNodes(environment.root);

  return [
    ...flatMap(nodes, (node) => listNodeErrors(node, environment)),
    ...environment.unreached.map(({ path, kind, config, files }) => {
      const sources = [...(config ? ["the config"] : []), ...files];

      return {
        severity: "error" as const,
        code: "unreached" as const,
        message: `unreached ${kind}, declared by ${sources.join(", ")}`,
        environment: environment.name,
        path,
        files,
      };
    }),
    ...nodes
      .filter((node) => {
        return node.kind === "domain" && node.purpose === undefined;
      })
      .map((node) => {
        return {
          severity: "warning" as const,
          code: "missing-purpose" as const,
          message: "has no purpose: set one on its `domains` entry.",
          environment: environment.name,
          path: node.path,
          files: [],
        };
      }),
  ];
}
