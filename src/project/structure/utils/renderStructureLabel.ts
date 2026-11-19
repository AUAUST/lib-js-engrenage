import type { StructureNode } from "#project/structure/types/StructureNode";

function members(node: StructureNode): StructureNode[] {
  return node.children.filter(({ kind }) => {
    return kind === "domain" || kind === "namespace";
  });
}

function isPlain(node: StructureNode): boolean {
  return node.kind === "domain" && node.purpose === undefined;
}

function renderName(node: StructureNode): string {
  const collects = node.collects === undefined || node.collects.length === 0
    ? ""
    : `[collects: ${node.collects.join(" ")}]`;

  const directory = node.kind === "namespace" || node.kind === "mirror";

  return `${node.name}${directory ? "/" : ""}${node.public === true ? "*" : ""}${collects}`;
}

function inline(node: StructureNode): string {
  const children = members(node);

  return children.length === 0
    ? renderName(node)
    : `${renderName(node)}{${children.map(inline).join(" ")}}`;
}

function describeKind(
  node: StructureNode,
  detailed: boolean,
): string | undefined {
  const effects = node.effects === undefined ? "" : ` (${node.effects})`;

  const kinds = {
    namespace: undefined,
    domain: node.commands === true ? "command group" : "domain",
    role: node.role === undefined || node.role === node.name
      ? `role${effects}`
      : `role ${node.role}${effects}`,
    mirror: `mirrors ${node.mirror === undefined ? node.name : node.mirror.path}`,
    unclassified: node.reason === undefined
      ? "unclassified"
      : `unclassified (${node.reason})`,
  } satisfies Record<StructureNode["kind"], string | undefined>;

  return detailed || node.kind === "mirror" ? kinds[node.kind] : undefined;
}

export function renderStructureLabel({
  node,
  aliases,
  detailed,
  name,
  inlined = false,
  extras = [],
}: {
  node: StructureNode;
  aliases: ReadonlyMap<string, string>;
  detailed: boolean;
  name?: string;
  inlined?: boolean;
  extras?: readonly string[];
}): string {
  const plain = detailed ? [] : members(node).filter(isPlain);

  return [
    name ?? (inlined ? inline(node) : renderName(node)),
    detailed || node.kind !== "domain" ? aliases.get(node.path) : undefined,
    node.layers?.join(" < "),
    node.relation === "isolated" ? "[isolated]" : undefined,
    node.childKind === "domains" ? "[domains]" : undefined,
    plain.length === 0 ? undefined : plain.map(inline).join(" "),
    describeKind(node, detailed),
    detailed ? `[${node.source}]` : undefined,
    node.purpose,
    ...extras,
  ]
    .filter((part) => part !== undefined)
    .join("  ");
}
