import { flatMap } from "@auaust/primitive-kit/arrays";
import { entries } from "@auaust/toolkit/object";

import type { EnvironmentStructure } from "#project/structure/types/EnvironmentStructure";
import type { ImportRule } from "#project/structure/types/ImportRule";
import type { ImportRuleSource } from "#project/structure/types/ImportRuleSource";
import type { ImportRuleTarget } from "#project/structure/types/ImportRuleTarget";
import type { ResolvedRoleContract } from "#project/structure/types/ResolvedRoleContract";
import type { ResolvedRoles } from "#project/structure/types/ResolvedRoles";
import type { ResolvedStructure } from "#project/structure/types/ResolvedStructure";
import type { StructureEnvironmentName } from "#project/structure/types/StructureEnvironmentName";
import type { StructureNode } from "#project/structure/types/StructureNode";
import type { Globs } from "#types/Globs";

interface Parent {
  readonly path: string;
  readonly layers: readonly string[] | undefined;
}

function code(value: string): string {
  return `\`${value}\``;
}

function list(values: readonly string[]): string {
  return values.map(code).join(", ");
}

function cell(value: string): string {
  return value.replaceAll("|", String.raw`\|`);
}

function unique<Value>(values: readonly Value[]): Value[] {
  return [...new Set(values)];
}

function describeSource(
  source: ImportRuleSource,
  patterns: { plain: Globs; source: Globs; dist: Globs },
): string {
  switch (source.kind) {
    case "environment": {
      return `${source.environment} environment`;
    }

    case "test-variant": {
      const globs = {
        plain: patterns.plain,
        src: patterns.source,
        dist: patterns.dist,
      }[source.variant];

      return `test files ${list(globs)}`;
    }

    case "element": {
      return code(source.path);
    }

    case "file": {
      return code(source.path);
    }
  }
}

function describeTarget(target: ImportRuleTarget): string {
  switch (target.kind) {
    case "category": {
      return target.category;
    }

    case "element": {
      return code(target.path);
    }

    case "index": {
      return code(target.path);
    }

    case "modules": {
      return code(`${target.path}/*`);
    }

    case "file": {
      return code(target.path);
    }
  }
}

function describeNotes({ typeOnly, enforceable, reason }: ImportRule): string {
  return `${typeOnly && !reason.includes("type-only") ? " (type-only)" : ""}${enforceable ? "" : " (not enforced by lint)"}`;
}

function describeRule(rule: ImportRule, targets: readonly string[]): string {
  const subject = `${rule.effect === "forbid" ? "never: " : ""}${rule.reason}`;

  return `${subject}${targets.length === 0 ? "" : ` → ${unique(targets).join(", ")}`}${describeNotes(rule)}`;
}

function describeContract(contract: ResolvedRoleContract): string {
  const parts = [
    contract.file === undefined
      ? undefined
      : `file ${list([contract.file].flat())}`,
    contract.accepts === undefined
      ? undefined
      : `accepts ${list([contract.accepts].flat())}`,
    contract.roles === undefined ? undefined : `roles ${list(contract.roles)}`,
    contract.categories === true ? "category subdirectories" : undefined,
    contract.exports === undefined ? undefined : `exports ${contract.exports}`,
    contract.nesting === 0 ? undefined : `nesting ${contract.nesting}`,
    contract.index ? "`index` allowed" : undefined,
    contract.discovered ? "discovered" : undefined,
    contract.scoped ? "scoped" : undefined,
  ];

  return parts.filter((part) => part !== undefined).join("; ");
}

function collect(node: StructureNode): StructureNode[] {
  return [node, ...flatMap(node.children, collect)];
}

function layerName({ layer }: StructureNode, parent: Parent): string {
  return layer === undefined ? "" : (parent.layers?.[layer] ?? String(layer));
}

function renderRoles(
  roles: ResolvedRoles,
  rolesRules: ReadonlyMap<string, readonly string[]>,
): string[] {
  const rows = entries(roles.roles).map(([name, contract]) => {
    const imports = rolesRules.get(name) ?? [];

    return `| ${cell(code(name))} | ${cell(describeContract(contract))} | ${cell(imports.join("; ") || "as its domain")} | ${contract.public ? "yes" : "no"} |`;
  });

  return rows.length === 0
    ? []
    : [
        "| Role | Contents and contract | Allowed imports | Public |",
        "| --- | --- | --- | --- |",
        ...rows,
        "",
      ];
}

function renderNode(
  node: StructureNode,
  parent: Parent,
  elementRules: ReadonlyMap<string, readonly ImportRule[]>,
): string[] {
  const layer = layerName(node, parent);

  const children = node.children.filter(({ kind }) => {
    return kind === "domain" || kind === "namespace";
  });

  const lines = [`#### ${code(node.path)}`, ""];

  if (node.kind === "namespace") {
    lines.push(
      `- Namespace${layer === "" ? "" : `, layer ${code(layer)} of ${code(parent.path)}`}`,
      ...(node.layers === undefined
        ? ["- Layers: none, children are peers"]
        : [`- Layers: ${node.layers.map(code).join(" < ")}`]),
    );
  } else {
    const visibility =
      node.public === true
        ? `public${node.specifier === undefined ? "" : ` as ${code(node.specifier)}`}`
        : "internal";

    lines.push(
      `- Domain in ${code(parent.path)}${layer === "" ? "" : `, layer ${code(layer)}`}`,
      `- Visibility: ${visibility}`,
      ...(node.purpose === undefined ? [] : [`- Purpose: ${node.purpose}`]),
    );
  }

  if (children.length > 0) {
    lines.push(`- Children: ${list(children.map(({ path }) => path))}`);
  }

  if (node.kind === "domain") {
    const rules = elementRules.get(node.path) ?? [];

    if (rules.length > 0) {
      lines.push("- Imports:");

      for (const rule of rules) {
        const surfaces = rule.targets
          .filter(({ kind }) => kind === "index")
          .map(describeTarget);

        lines.push(`  - ${describeRule(rule, surfaces)}`);
      }
    }
  }

  lines.push("");

  const next: Parent = { path: node.path, layers: node.layers };

  return [
    ...lines,
    ...flatMap(children, (child) => renderNode(child, next, elementRules)),
  ];
}

function renderEnvironment({
  name,
  environment,
  roles,
  elementRules,
  extra,
}: {
  name: StructureEnvironmentName;
  environment: EnvironmentStructure;
  roles: ResolvedRoles | undefined;
  elementRules: ReadonlyMap<string, readonly ImportRule[]>;
  extra: readonly string[];
}): string[] {
  const nodes = collect(environment.root);

  const rolesRules = new Map<string, string[]>();

  for (const node of nodes) {
    if (node.kind !== "role" || node.role === undefined) {
      continue;
    }

    const reasons = (elementRules.get(node.path) ?? []).map((rule) => {
      return describeRule(rule, []);
    });

    rolesRules.set(
      node.role,
      unique([...(rolesRules.get(node.role) ?? []), ...reasons]),
    );
  }

  const rootChildren = environment.root.children.filter(({ kind }) => {
    return kind === "domain" || kind === "namespace";
  });

  const mirrors = environment.root.children.filter(({ kind }) => {
    return kind === "mirror";
  });

  const root: Parent = {
    path: environment.root.path,
    layers: environment.root.layers,
  };

  return [
    `### ${name} (${environment.strictness})`,
    "",
    `Directories: ${list(environment.dirs)}`,
    ...(environment.root.layers === undefined
      ? []
      : [
          "",
          `Layers of ${code(environment.root.path)}: ${environment.root.layers.map(code).join(" < ")}`,
        ]),
    ...(extra.length === 0 ? [] : ["", ...extra]),
    ...(mirrors.length === 0
      ? []
      : [
          "",
          `Root keys: ${mirrors
            .map(({ name: key, mirror }) => {
              return `${code(key)}${mirror === undefined ? "" : ` (tests ${code(mirror.path)})`}`;
            })
            .join(", ")}`,
        ]),
    ...(environment.unclassified.length === 0
      ? []
      : [
          "",
          `Unclassified: ${list(environment.unclassified.map(({ path }) => path))}`,
        ]),
    "",
    ...(roles === undefined ? [] : renderRoles(roles, rolesRules)),
    ...flatMap(rootChildren, (child) => renderNode(child, root, elementRules)),
  ];
}

// @debt the map lists long peer and lower-layer targets per domain (about 580 lines, loaded at every session start) and is written by `sync` only, so a project that ran init without sync has none
export function renderProjectMap({
  structure,
  importRules,
  roles,
  tests,
}: {
  structure: ResolvedStructure;
  importRules: readonly ImportRule[];
  roles: Readonly<Partial<Record<StructureEnvironmentName, ResolvedRoles>>>;
  tests: {
    layout: "roots" | "mirror";
    patterns: { plain: Globs; source: Globs; dist: Globs };
  };
}): string {
  const nodePaths = new Set(
    flatMap(
      entries(structure).flatMap(([, environment]) => {
        return environment === undefined ? [] : [environment];
      }),
      ({ root }) => collect(root).map(({ path }) => path),
    ),
  );

  const elementRules = new Map<string, ImportRule[]>();
  const otherRules: ImportRule[] = [];

  for (const rule of importRules) {
    if (rule.source.kind === "element" && nodePaths.has(rule.source.path)) {
      elementRules.set(rule.source.path, [
        ...(elementRules.get(rule.source.path) ?? []),
        rule,
      ]);
    } else {
      otherRules.push(rule);
    }
  }

  const environments = entries(structure).flatMap(([name, environment]) => {
    if (environment === undefined) {
      return [];
    }

    const extra =
      name === "tests"
        ? [
            `Layout: ${code(tests.layout)}${tests.layout === "mirror" ? ", each directory below a root key mirrors one of that environment" : ", any directory below a root key is accepted"}`,
          ]
        : [];

    return renderEnvironment({
      name,
      environment,
      roles: name === "bin" ? undefined : roles[name],
      elementRules,
      extra,
    });
  });

  return [
    "# Project map",
    "",
    "Generated by `engrenage sync agents` from the project structure. Do not edit.",
    "",
    "## Environments",
    "",
    ...environments,
    ...(otherRules.length === 0
      ? []
      : [
          "## Imports between environments",
          "",
          ...otherRules.map((rule) => {
            const targets = rule.targets.map(describeTarget);

            return `- ${describeSource(rule.source, tests.patterns)}: ${describeRule(rule, targets)}`;
          }),
          "",
        ]),
  ]
    .join("\n")
    .replaceAll(/\n{3,}/g, "\n\n")
    .trimEnd()
    .concat("\n");
}
