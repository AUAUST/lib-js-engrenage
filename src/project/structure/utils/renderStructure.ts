import { flatMap } from "@auaust/primitive-kit/arrays";
import { afterNth } from "@auaust/primitive-kit/strings";
import { max } from "@auaust/toolkit/math";
import { keys } from "@auaust/toolkit/object";

import type { ResolvedStructure } from "#project/structure/types/ResolvedStructure";
import type { StructureNode } from "#project/structure/types/StructureNode";

const indentation = "  ";

const dot = "·";

const pathPaddingWidth = 32;

const purposePaddingWidth = 44;

function describe(node: StructureNode): string {
  const details = [
    ...(node.layers === undefined
      ? []
      : [`layers: ${node.layers.join(" < ")}`]),
    ...(node.relation === undefined || node.relation === "peers"
      ? []
      : [`relation: ${node.relation}`]),
  ];

  const kinds = {
    get namespace() {
      return `namespace ${dot}${details.length === 0 ? "" : ` (${details.join("; ")})`}`;
    },
    get domain() {
      return `${node.commands === true ? "command group" : "domain"} ${dot} (${node.public === true ? "public" : "internal"})`;
    },
    get role() {
      return `role ${dot} ${node.role ?? node.name} ${node.effects === undefined ? "" : `(${node.effects})`}`;
    },
    get mirror() {
      return node.mirror === undefined
        ? "mirror"
        : `mirror of ${node.mirror.path} ${dot}`;
    },
    get unclassified() {
      return node.reason === undefined
        ? "unclassified"
        : `unclassified ${dot} (${node.reason})`;
    },
  } satisfies Record<StructureNode["kind"], string>;

  return kinds[node.kind];
}

function render(node: StructureNode, depth: number): string[] {
  const indent = indentation.repeat(depth);

  // @debt proper path segments provided by the node would be preferable
  const subpath = afterNth(node.path, "/", depth - 1) || node.path;

  const padding = dot.repeat(
    pathPaddingWidth - indent.length - subpath.length - node.kind.length,
  );

  const description = `${describe(node)} [${node.source}]`;

  return [
    `${indent}${subpath} ${padding} ${description}${node.purpose ? ` ${dot.repeat(max(0, purposePaddingWidth - description.length + node.kind.length))} ${node.purpose}` : ""}`,
    ...(node.strays ?? []).map((file) => {
      return `${indent}${indentation}${file} unclassified (file outside any role)`;
    }),
    ...(node.cardinality ?? []).map(({ role, files }) => {
      return `${indent}${indentation}\`${role}\` holds at most one file here; found ${files.join(", ")}.`;
    }),
    ...flatMap(node.children, (child) => render(child, depth + 1)),
  ];
}

// @debt the entire renderer is quite ad-hoc and could benefit from a more structured approach
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
