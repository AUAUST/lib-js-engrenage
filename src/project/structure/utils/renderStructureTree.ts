import { flatMap } from "@auaust/toolkit/array";

import {
  listNodeViolations,
  type EnvironmentStructure,
  type StructureNode,
} from "#batiment/structure/index";
import { findStructureAliases } from "#project/structure/utils/findStructureAliases";
import { renderStructureLabel } from "#project/structure/utils/renderStructureLabel";
import type { Alias } from "#project/structure/types/Alias";

interface TreeRow {
  readonly line: string;
  readonly node?: StructureNode;
}

// @debt one `detailed` flag branches row selection, labels and kinds across every helper; two row policies sharing the drawing would keep each output's rules in one place
interface TreeOptions {
  readonly aliases: ReadonlyMap<string, string>;
  readonly detailed: boolean;
}

function listDiagnostics(node: StructureNode): TreeRow[] {
  return [
    ...(node.strays ?? []).map((file) => {
      return `${file}  unclassified (file outside any role)`;
    }),
    ...listNodeViolations(node),
  ].map((line) => {
    return { line };
  });
}

function listRows(node: StructureNode, options: TreeOptions): TreeRow[] {
  if (options.detailed) {
    return [
      ...listDiagnostics(node),
      ...node.children.map((child) => {
        return {
          line: renderStructureLabel({ node: child, ...options }),
          node: child,
        };
      }),
    ];
  }

  if (node.kind === "mirror") {
    return [];
  }

  return node.children
    .filter(({ kind, purpose }) => {
      return (
        kind === "namespace" ||
        kind === "mirror" ||
        (kind === "domain" && purpose !== undefined)
      );
    })
    .map((child) => {
      return {
        line: renderStructureLabel({
          node: child,
          ...options,
          inlined: child.kind === "domain",
        }),
        node: child,
      };
    });
}

function renderRows(
  node: StructureNode,
  options: TreeOptions,
  prefix: string,
): string[] {
  const rows = listRows(node, options);

  return flatMap(rows, ({ line, node: child }, index) => {
    const last = index === rows.length - 1;

    return [
      `${prefix}${last ? "└─ " : "├─ "}${line}`,
      ...(child === undefined
        ? []
        : renderRows(child, options, `${prefix}${last ? "   " : "│  "}`)),
    ];
  });
}

export function renderStructureTree({
  environment,
  aliases,
  globalRoles = [],
  detailed = false,
}: {
  environment: EnvironmentStructure;
  aliases: readonly Alias[];
  globalRoles?: readonly string[];
  detailed?: boolean;
}): string[] {
  const { root } = environment;

  const options = {
    aliases: findStructureAliases(environment, aliases),
    detailed,
  };

  return [
    renderStructureLabel({
      node: root,
      ...options,
      name: `${environment.dirs.join("/ ")}/`,
      extras: [
        ...(detailed ? [`(${environment.strictness})`] : []),
        ...(globalRoles.length === 0
          ? []
          : [`(global roles: ${globalRoles.join(" ")})`]),
      ],
    }),
    ...renderRows(root, options, ""),
  ];
}
