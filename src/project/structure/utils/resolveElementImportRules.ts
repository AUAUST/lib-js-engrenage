import { join } from "node:path";

import { flatMap } from "@auaust/primitive-kit/arrays";
import { entries } from "@auaust/toolkit/object";

import { entryRoleName, indexRoleName } from "#project/roles/constants";
import { collectStructureNodes } from "#project/structure/utils/collectStructureNodes";
import { createImportRule } from "#project/structure/utils/createImportRule";
import { getEnvironmentRootRole } from "#project/structure/utils/getEnvironmentRootRole";
import { listStaticFileGlobs } from "#project/structure/utils/listStaticFileGlobs";
import type { EnvironmentStructure } from "#project/structure/types/EnvironmentStructure";
import type { ImportRelation } from "#project/structure/types/ImportRelation";
import type { ImportRule } from "#project/structure/types/ImportRule";
import type { ImportRuleSource } from "#project/structure/types/ImportRuleSource";
import type { ImportRuleTarget } from "#project/structure/types/ImportRuleTarget";
import type { ResolvedRoles } from "#project/structure/types/ResolvedRoles";
import type { StructureNode } from "#project/structure/types/StructureNode";

interface Reach {
  readonly relation: ImportRelation;
  readonly targets: readonly ImportRuleTarget[];
  readonly reason: string;
}

interface Scope {
  readonly reaches: readonly Reach[];
  readonly ancestors: readonly StructureNode[];
}

function indexOf({ path }: StructureNode, file: string): ImportRuleTarget {
  return {
    kind: "index",
    path,
    file,
  };
}

// @debt the maps render expanded element rules while lint decides from entities; #227 renders the checks instead
export function resolveElementImportRules(
  structure: EnvironmentStructure,
  { roles }: ResolvedRoles,
): ImportRule[] {
  const rules: ImportRule[] = [];

  const fileGlobs = flatMap(entries(roles), ([name, { file }]) => {
    return file === undefined
      ? []
      : [{ name, globs: listStaticFileGlobs(file) }];
  });

  function filesOf(directory: string, only?: string): ImportRuleTarget[] {
    return fileGlobs
      .filter(({ name }) => {
        return only === undefined
          ? name !== indexRoleName && name !== entryRoleName
          : name === only;
      })
      .flatMap(({ globs }) => {
        return globs.map((glob): ImportRuleTarget => {
          return { kind: "file", path: join(directory, glob) };
        });
      });
  }

  function rolesOf(node: StructureNode): StructureNode[] {
    return node.children.filter(({ kind }) => kind === "role");
  }

  function modulesOf(role: StructureNode): ImportRuleTarget {
    return { kind: "modules", path: role.path };
  }

  function ownTargets(node: StructureNode): ImportRuleTarget[] {
    return [...rolesOf(node).map(modulesOf), ...filesOf(node.path)];
  }

  function isPublic({ role }: StructureNode): boolean {
    return role !== undefined && roles[role]?.public;
  }

  const publicFileRoles = fileGlobs
    .filter(({ name }) => {
      return (
        name !== indexRoleName && name !== entryRoleName && roles[name]?.public
      );
    })
    .map(({ name }) => name);

  function surface(node: StructureNode): ImportRuleTarget[] {
    if (node.kind === "domain") {
      return [
        indexOf(node, structure.indexFile),
        ...rolesOf(node).filter(isPublic).map(modulesOf),
        ...flatMap(publicFileRoles, (name) => filesOf(node.path, name)),
      ];
    }

    return node.kind === "namespace" ? flatMap(node.children, surface) : [];
  }

  function members(container: StructureNode): StructureNode[] {
    return container.children.filter(({ kind }) => {
      return kind === "domain" || kind === "namespace";
    });
  }

  const globalRoles = rolesOf(structure.root);

  const globalTargets: ImportRuleTarget[] = [
    ...globalRoles.map(modulesOf),
    ...flatMap(structure.dirs, (directory) => filesOf(directory)),
  ];

  function emitDomain(domain: StructureNode, scope: Scope) {
    const source: ImportRuleSource = { kind: "element", path: domain.path };
    const subdomains = members(domain);

    const grants = [
      {
        targets: ownTargets(domain),
        relation: "own-roles" as const,
        reason: "a domain imports its own roles and files",
      },
      {
        targets: globalTargets,
        relation: "global-roles" as const,
        reason: "anything imports global roles",
      },
      {
        targets: flatMap(scope.ancestors, ownTargets),
        relation: "ancestor-roles" as const,
        reason: "a sub-domain imports its ancestors' roles directly",
      },
      {
        targets: flatMap(subdomains, surface),
        relation: "sub-domain" as const,
        reason:
          "a domain reaches a sub-domain through its index.ts and public roles",
      },
      ...scope.reaches,
    ];

    for (const { targets, relation, reason } of grants) {
      rules.push(
        ...createImportRule(source, targets, relation, "allow", reason),
      );
    }

    if (structure.entryFile !== undefined && domain.public === true) {
      rules.push(
        ...createImportRule(
          {
            kind: "file",
            path: join(domain.path, structure.entryFile),
          },
          surface(domain),
          "own-roles",
          "allow",
          "a package entry re-exports its own domain's index.ts and public roles",
        ),
      );
    }

    for (const role of rolesOf(domain)) {
      const roleSource: ImportRuleSource = { kind: "element", path: role.path };

      if (role.role !== undefined && roles[role.role]?.typeOnly) {
        for (const { targets, relation, reason } of grants) {
          rules.push(
            ...createImportRule(
              roleSource,
              targets,
              relation,
              "allow",
              `${reason}, type-only`,
              { typeOnly: true },
            ),
          );
        }
      }

      if (role.role !== undefined && roles[role.role]?.effects !== undefined) {
        for (const { targets, relation, reason } of grants) {
          rules.push(
            ...createImportRule(roleSource, targets, relation, "allow", reason),
          );
        }
      }
    }
  }

  function visit(container: StructureNode, scope: Scope) {
    const siblings = members(container);

    for (const member of siblings) {
      const others = siblings.filter((other) => other !== member);

      const lower =
        container.layers === undefined
          ? []
          : others.filter(({ layer }) => {
              return (
                layer !== undefined &&
                member.layer !== undefined &&
                layer < member.layer
              );
            });

      const peers =
        container.relation === "isolated"
          ? []
          : container.layers === undefined
            ? others
            : others.filter(({ layer }) => {
                return layer !== undefined && layer === member.layer;
              });

      // @debt the lower-layer and peer reasons say "through their index.ts" while `surface` also grants public roles (constants, errors, ports, adapters), so the maps understate what may be imported directly
      const next: Scope = {
        ancestors: scope.ancestors,
        reaches: [
          ...scope.reaches,
          {
            relation: "lower-layer",
            targets: flatMap(lower, surface),
            reason: "domains of a lower layer, through their index.ts",
          },
          {
            relation: "peer",
            targets: flatMap(peers, surface),
            reason: "peers, through their index.ts",
          },
        ],
      };

      if (member.kind === "domain") {
        emitDomain(member, next);

        visit(member, {
          reaches: next.reaches,
          ancestors: [member, ...next.ancestors],
        });
      } else {
        visit(member, next);
      }
    }
  }

  for (const role of globalRoles) {
    rules.push(
      ...createImportRule(
        { kind: "element", path: role.path },
        globalTargets,
        "global-roles",
        "allow",
        "global roles import only each other",
      ),
    );
  }

  visit(structure.root, { reaches: [], ancestors: [] });

  const rootRole = getEnvironmentRootRole(structure, roles);

  if (rootRole !== undefined) {
    const surfaces = flatMap(
      collectStructureNodes(structure.root).filter(
        ({ kind }) => kind === "domain",
      ),
      (domain) => {
        return [
          ...surface(domain),
          ...(rootRole.role === entryRoleName && domain.public === true
            ? [
                {
                  kind: "file",
                  path: join(domain.path, rootRole.file),
                } satisfies ImportRuleTarget,
              ]
            : []),
        ];
      },
    );

    for (const directory of structure.dirs) {
      rules.push(
        ...createImportRule(
          { kind: "file", path: join(directory, rootRole.file) },
          globalTargets,
          "global-roles",
          "allow",
          "anything imports global roles",
        ),
        ...createImportRule(
          { kind: "file", path: join(directory, rootRole.file) },
          surfaces,
          "root-entry",
          "allow",
          `the ${rootRole.file} of an environment root imports any public surface`,
        ),
      );
    }
  }

  return rules;
}
