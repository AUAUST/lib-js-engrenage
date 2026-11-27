import { findStructureAliases } from "#batiment/structure/utils/findStructureAliases";
import { listNodeViolations } from "#batiment/structure/utils/listNodeViolations";
import { renderStructureLabel } from "#batiment/structure/utils/renderStructureLabel";
import { treeEntry, type TreeEntry, type TreeNode } from "#nexus/reports/index";
import type { Alias } from "#batiment/structure/types/Alias";
import type { NamespaceStructure } from "#batiment/structure/types/NamespaceStructure";
import type { StructureNode } from "#batiment/structure/types/StructureNode";

interface TreeRow {
  readonly line: string;
  readonly node?: StructureNode;
}

// @debt one `detailed` flag branches row selection, labels and kinds across every helper; two row policies sharing the drawing would keep each output's rules in one place
interface TreeOptions {
  readonly aliases: ReadonlyMap<string, string>;
  readonly detailed: boolean;
  readonly groupLabel: string | undefined;
  readonly globalRoles: ReadonlyMap<StructureNode, readonly string[]>;
}

function renderGlobalRoles(
  node: StructureNode,
  { globalRoles }: TreeOptions,
): readonly string[] {
  const roles = globalRoles.get(node) ?? [];

  return roles.length === 0 ? [] : [`(global roles: ${roles.join(" ")})`];
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
    .filter(({ kind, purpose, debt }) => {
      return (
        kind === "namespace" ||
        kind === "directory" ||
        kind === "mirror" ||
        (kind === "domain" && (purpose !== undefined || debt !== undefined))
      );
    })
    .map((child) => {
      return {
        line: renderStructureLabel({
          node: child,
          ...options,
          inlined: child.kind === "domain",
          extras: renderGlobalRoles(child, options),
        }),
        node: child,
      };
    });
}

function listNodes(node: StructureNode, options: TreeOptions): TreeNode[] {
  return listRows(node, options).map(({ line, node: child }) => {
    return {
      label: line,
      children: child === undefined ? [] : listNodes(child, options),
    };
  });
}

export function createStructureTree({
  namespace,
  aliases,
  globalRoles = new Map(),
  detailed = false,
}: {
  namespace: NamespaceStructure;
  aliases: readonly Alias[];
  globalRoles?: ReadonlyMap<StructureNode, readonly string[]>;
  detailed?: boolean;
}): TreeEntry {
  const { root } = namespace;

  const spansDirectories = root.children.some(({ kind }) => {
    return kind === "directory";
  });

  const options = {
    aliases: findStructureAliases(namespace, aliases),
    detailed,
    groupLabel: namespace.layout?.nature === "recursive"
      ? namespace.layout.node.label
      : undefined,
    globalRoles,
  };

  return treeEntry([
    {
      label: renderStructureLabel({
        node: root,
        ...options,
        name: spansDirectories
          ? namespace.name
          : `${namespace.dirs.join("/ ")}/`,
        extras: [
          ...(detailed ? [`(${namespace.strictness})`] : []),
          ...renderGlobalRoles(root, options),
        ],
      }),
      children: listNodes(root, options),
    },
  ]);
}
