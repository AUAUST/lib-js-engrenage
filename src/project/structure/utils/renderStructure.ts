import { flatMap } from "@auaust/primitive-kit/arrays";
import { keys } from "@auaust/toolkit/object";

import type { ResolvedStructure } from "#config/types/ResolvedStructure";
import type { StructureNode } from "#project/structure/types/StructureNode";

const indentation = "  ";

function describe(node: StructureNode): string {
  const layers =
    node.layers === undefined ? "" : ` (layers: ${node.layers.join(" < ")})`;

  const kinds = {
    namespace: `namespace${layers}`,
    domain: `domain (${node.public === true ? "public" : "internal"})`,
    role: `role ${node.role ?? node.name}`,
    mirror:
      node.mirror === undefined ? "mirror" : `mirror of ${node.mirror.path}`,
    unclassified:
      node.reason === undefined
        ? "unclassified"
        : `unclassified (${node.reason})`,
  } satisfies Record<StructureNode["kind"], string>;

  return kinds[node.kind];
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
