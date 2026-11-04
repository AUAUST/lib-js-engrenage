import { flatMap } from "@auaust/primitive-kit/arrays";
import { keys } from "@auaust/toolkit/object";

import type { ResolvedStructure } from "#project/structure/types/ResolvedStructure";
import type { StructureNode } from "#project/structure/types/StructureNode";

const indentation = "  ";

function describe(node: StructureNode): string {
  const details = [
    ...(node.layers === undefined
      ? []
      : [`layers: ${node.layers.join(" < ")}`]),
    ...(node.relation === undefined || node.relation === "peers"
      ? []
      : [`relation: ${node.relation}`]),
  ];

  const layers = details.length === 0 ? "" : ` (${details.join("; ")})`;

  const kinds = {
    namespace: `namespace${layers}`,
    domain: `${node.commands === true ? "command group" : "domain"} (${node.public === true ? "public" : "internal"})`,
    role: `role ${node.role ?? node.name}${node.effects === undefined ? "" : ` (${node.effects})`}`,
    mirror:
      node.mirror === undefined ? "mirror" : `mirror of ${node.mirror.path}`,
    unclassified:
      node.reason === undefined
        ? "unclassified"
        : `unclassified (${node.reason})`,
  } satisfies Record<StructureNode["kind"], string>;

  return `${kinds[node.kind]}${node.purpose === undefined ? "" : `  ${node.purpose}`}`;
}

function render(node: StructureNode, depth: number): string[] {
  const indent = indentation.repeat(depth);

  return [
    `${indent}${node.path}  ${describe(node)}  [${node.source}]`,
    ...(node.strays ?? []).map((file) => {
      return `${indent}${indentation}${file}  unclassified (file outside any role)`;
    }),
    ...flatMap(node.children, (child) => render(child, depth + 1)),
  ];
}

export function renderStructure(structure: ResolvedStructure): string[] {
  return flatMap(keys(structure), (name) => {
    const environment = structure[name];

    return environment === undefined
      ? []
      : [
          `${name} (${environment.strictness})`,
          ...flatMap(environment.root.children, (child) => render(child, 1)),
        ];
  });
}
