import { flatMap } from "@auaust/primitive-kit/arrays";

import type { Alias } from "#project/structure/types/Alias";
import type { EnvironmentStructure } from "#project/structure/types/EnvironmentStructure";
import type { StructureNode } from "#project/structure/types/StructureNode";

interface TreeRow {
  readonly line: string;
  readonly node?: StructureNode;
}

// @debt one `detailed` flag branches row selection, labels and kinds across every helper; two row policies sharing the drawing would keep each output's rules in one place
interface TreeOptions {
  readonly aliases: ReadonlyMap<string, string>;
  readonly detailed: boolean;
}

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

function renderLabel(
  node: StructureNode,
  { aliases, detailed }: TreeOptions,
  name: string,
  extras: readonly string[] = [],
): string {
  const plain = detailed ? [] : members(node).filter(isPlain);

  return [
    name,
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

function listDiagnostics(node: StructureNode): TreeRow[] {
  return [
    ...(node.strays ?? []).map((file) => {
      return {
        line: `${file}  unclassified (file outside any role)`,
      };
    }),
    ...(node.cardinality ?? []).map(({ role, reason, files, globs }) => {
      return {
        line: reason === "unique"
          ? `\`${role}\` holds at most one file here; found ${files.join(", ")}.`
          : `\`${role}\` requires a file here; add one matching ${globs.join(", ")}.`,
      };
    }),
    ...(node.twin === undefined
      ? []
      : [
          {
            line: `${node.twin} sits beside the command group ${node.path}; move it into the group or rename one of them.`,
          },
        ]),
  ];
}

function listRows(node: StructureNode, options: TreeOptions): TreeRow[] {
  if (options.detailed) {
    return [
      ...listDiagnostics(node),
      ...node.children.map((child) => {
        return {
          line: renderLabel(child, options, renderName(child)),
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
        line: renderLabel(
          child,
          options,
          child.kind === "domain" ? inline(child) : renderName(child),
        ),
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

function findAliases(
  { root }: EnvironmentStructure,
  aliases: readonly Alias[],
): Map<string, string> {
  const found = new Map<string, string>();

  for (const child of root.children) {
    const alias = aliases.find(({ key, path }) => {
      return key === `#${child.name}/*` && path === child.path;
    });

    if (alias !== undefined) {
      found.set(child.path, `#${child.name}/…`);
    }
  }

  return found;
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
    aliases: findAliases(environment, aliases),
    detailed,
  };

  return [
    renderLabel(root, options, `${environment.dirs.join("/ ")}/`, [
      ...(detailed ? [`(${environment.strictness})`] : []),
      ...(globalRoles.length === 0
        ? []
        : [`(global roles: ${globalRoles.join(" ")})`]),
    ]),
    ...renderRows(root, options, ""),
  ];
}
