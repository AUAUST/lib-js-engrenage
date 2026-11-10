import { stringify } from "yaml";

import { flatMap } from "@auaust/primitive-kit/arrays";
import { entries } from "@auaust/toolkit/object";

import { entryRoleName, indexRoleName } from "#project/roles/constants";
import {
  listStaticFileGlobs,
  type EnvironmentStructure,
  type ResolvedRoles,
  type StructureNode,
} from "#project/structure/index";
import type { Globs } from "#types/Globs";

// @debt map renderers repeat code and list text formatting helpers
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

    const line = child.kind === "namespace"
      ? renderLine(child, aliases)
      : `${inline(child)}  ${child.purpose}`;

    return [
      `${prefix}${last ? "└─ " : "├─ "}${line}`,
      ...renderTree(child, aliases, `${prefix}${last ? "   " : "│  "}`),
    ];
  });
}

export function renderEnvironmentMap({
  name,
  environment,
  roles,
  aliases,
  paths,
}: {
  name: string;
  environment: EnvironmentStructure;
  roles: ResolvedRoles | undefined;
  aliases: ReadonlyMap<string, string>;
  paths: Globs;
}): string {
  const { root } = environment;

  const mirrors = root.children.filter(({ kind }) => kind === "mirror");

  const globalRoles = [
    ...root.children
      .filter((child) => child.kind === "role")
      .map(({ name: role }) => role),
    ...entries(roles?.roles ?? {}).flatMap(([role, contract]) => {
      return role === indexRoleName || role === entryRoleName || contract.scoped
        ? []
        : listStaticFileGlobs(contract.file);
    }),
  ];

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
    ...(name === "bin" && root.commands === true
      ? [
          "",
          "Commands: one directory per command group, whose `index.ts` names its subcommands and their aliases; the root group's `executable.ts` runs it; each other module is one command.",
        ]
      : []),
  ].join("\n");
}
