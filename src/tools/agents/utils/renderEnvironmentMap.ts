import { stringify } from "yaml";

import { flatMap } from "@auaust/primitive-kit/arrays";
import { entries } from "@auaust/toolkit/object";

import type {
  EnvironmentStructure,
  ResolvedRoles,
  StructureEnvironmentName,
  StructureNode,
} from "#project/structure/index";

function code(value: string): string {
  return `\`${value}\``;
}

function list(values: readonly string[]): string {
  return values.map(code).join(", ");
}

function members(node: StructureNode): StructureNode[] {
  return node.children.filter(({ kind }) => {
    return kind === "domain" || kind === "namespace";
  });
}

function inline(node: StructureNode): string {
  const children = members(node);

  const name = `${node.name}${node.kind === "namespace" ? "/" : ""}${node.public === true ? "*" : ""}`;

  return children.length === 0
    ? name
    : `${name}{${children.map(inline).join(" ")}}`;
}

function renderLine(
  node: StructureNode,
  aliases: ReadonlyMap<string, string>,
  globalRoles: readonly string[] = [],
): string {
  const children = members(node);

  const plain = children.filter(({ kind, purpose }) => {
    return kind === "domain" && purpose === undefined;
  });

  const alias = aliases.get(node.path);

  return [
    `${node.name}/`,
    alias,
    node.layers === undefined ? undefined : node.layers.join(" < "),
    node.relation === "isolated" ? "[isolated]" : undefined,
    plain.length === 0 ? undefined : plain.map(inline).join(" "),
    node.purpose,
    globalRoles.length === 0
      ? undefined
      : `(global roles: ${globalRoles.join(" ")})`,
  ]
    .filter((part) => part !== undefined)
    .join("  ");
}

function renderTree(
  node: StructureNode,
  aliases: ReadonlyMap<string, string>,
  prefix: string,
): string[] {
  const rows = members(node).filter(({ kind, purpose }) => {
    return kind === "namespace" || purpose !== undefined;
  });

  return flatMap(rows, (child, index) => {
    const last = index === rows.length - 1;

    const line =
      child.kind === "namespace"
        ? renderLine(child, aliases)
        : `${inline(child)}  ${child.purpose}`;

    return [
      `${prefix}${last ? "└─ " : "├─ "}${line}`,
      ...renderTree(child, aliases, `${prefix}${last ? "   " : "│  "}`),
    ];
  });
}

// @debt the table repeats in every environment map, lists roles no module of that environment uses (plugins and conventions in tests or scripts), drops the `public` flag that decides direct imports, and names effect levels without defining them
function renderRoles(roles: ResolvedRoles): string[] {
  const rows = entries(roles.roles).map(([name, contract]) => {
    const imports = [
      contract.typeOnly ? "type-only" : undefined,
      contract.effects === undefined ? undefined : `level ${contract.effects}`,
    ]
      .filter((part) => part !== undefined)
      .join(", ");

    return `| ${code(name)} | ${(contract.purpose ?? "").replaceAll("|", String.raw`\|`)} | ${imports} |`;
  });

  return rows.length === 0
    ? []
    : [
        "",
        `Effect levels, purest first: ${roles.effects.levels.map(code).join(" < ")}. A role with a level imports at runtime only roles of its level or a purer one. Global roles import only each other.`,
        "",
        "| Role | Purpose | Imports where they differ |",
        "| --- | --- | --- |",
        ...rows,
      ];
}

export function renderEnvironmentMap({
  name,
  environment,
  roles,
  aliases,
}: {
  name: StructureEnvironmentName;
  environment: EnvironmentStructure;
  roles: ResolvedRoles | undefined;
  aliases: ReadonlyMap<string, string>;
}): string {
  const { root } = environment;

  const mirrors = root.children.filter(({ kind }) => kind === "mirror");

  // @debt only directory roles are listed, so the global `constants.ts` behind `#constants` is missing from "(global roles: …)"
  const globalRoles = root.children
    .filter((child) => child.kind === "role")
    .map(({ name: role }) => role);

  const tree = [
    renderLine(
      { ...root, name: environment.dirs.join("/ ") },
      aliases,
      globalRoles,
    ),
    ...renderTree(root, aliases, ""),
    ...mirrors.map(({ name: key, mirror }, index) => {
      return `${index === mirrors.length - 1 ? "└─" : "├─"} ${key}/  mirrors ${mirror === undefined ? key : mirror.path}`;
    }),
  ];

  // @debt `paths` come from `dirs` only, so the tooling map never loads for the root config files it covers (`files`), and an environment without any directory still gets a map
  const paths = environment.dirs.map((dir) => {
    return dir === "." ? "**" : `${dir}/**`;
  });

  return [
    "---",
    stringify({ paths }).trimEnd(),
    "---",
    "",
    `# Project map: ${name}`,
    "",
    ...(environment.strictness === "loose"
      ? ["Strictness: loose, unclassified directories are plain domains.", ""]
      : []),
    "```",
    ...tree,
    "```",
    ...(environment.unclassified.length === 0
      ? []
      : [
          "",
          `Unclassified: ${list(environment.unclassified.map(({ path }) => path))}`,
        ]),
    ...(roles === undefined ? [] : renderRoles(roles)),
  ].join("\n");
}
