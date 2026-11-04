import { join } from "node:path";

import { flatMap, wrap } from "@auaust/primitive-kit/arrays";
import { entries, freeze, keys } from "@auaust/toolkit/object";

import { indexRole } from "#project/structure/constants";
import type { EnvironmentStructure } from "#project/structure/types/EnvironmentStructure";
import type { ImportCategory } from "#project/structure/types/ImportCategory";
import type { ImportRelation } from "#project/structure/types/ImportRelation";
import type { ImportRule } from "#project/structure/types/ImportRule";
import type { ImportRuleSource } from "#project/structure/types/ImportRuleSource";
import type { ImportRuleTarget } from "#project/structure/types/ImportRuleTarget";
import type { ResolvedRoles } from "#project/structure/types/ResolvedRoles";
import type { RoleEnvironment } from "#project/structure/types/RoleEnvironment";
import type { StructureEnvironmentName } from "#project/structure/types/StructureEnvironmentName";
import type { StructureNode } from "#project/structure/types/StructureNode";
import type { Directory } from "#types/Directory";

interface Reach {
  readonly relation: ImportRelation;
  readonly targets: readonly ImportRuleTarget[];
  readonly reason: string;
}

interface Scope {
  readonly reaches: readonly Reach[];
  readonly ancestors: readonly StructureNode[];
}

const elementEnvironments = ["src", "scripts", "tooling"] as const;

function category(name: ImportCategory): ImportRuleTarget {
  return { kind: "category", category: name };
}

function createRule(
  source: ImportRuleSource,
  targets: readonly ImportRuleTarget[],
  relation: ImportRelation,
  effect: ImportRule["effect"],
  reason: string,
  { typeOnly = false, enforceable = true } = {},
): ImportRule[] {
  return targets.length === 0
    ? []
    : [
        {
          source,
          targets,
          relation,
          effect,
          typeOnly,
          enforceable,
          reason,
        },
      ];
}

function resolveEnvironmentRules({
  active,
  published,
}: {
  active: Readonly<Record<StructureEnvironmentName, boolean>>;
  published: boolean;
}): ImportRule[] {
  const rules: ImportRule[] = [];

  function environment(name: StructureEnvironmentName) {
    return { kind: "environment", environment: name } as const;
  }

  function variant(name: "plain" | "src" | "dist") {
    return { kind: "test-variant", variant: name } as const;
  }

  if (active.src) {
    const source = environment("src");

    rules.push(
      ...createRule(
        source,
        [category("bin")],
        "test-variant",
        "forbid",
        "src never imports bin",
      ),
      ...createRule(
        source,
        [category("scripts")],
        "test-variant",
        "forbid",
        "src never imports scripts",
      ),
      ...createRule(
        source,
        [category("tests")],
        "test-variant",
        "forbid",
        "no environment imports tests",
      ),
      ...(published
        ? [
            ...createRule(
              source,
              [category("data")],
              "test-variant",
              "forbid",
              "a library's src never imports data/",
            ),
            ...createRule(
              source,
              [category("data")],
              "test-variant",
              "allow",
              "a library's src reads data/ at runtime through the public specifier",
              { enforceable: false },
            ),
          ]
        : createRule(
            source,
            [category("data")],
            "test-variant",
            "allow",
            "an app's src imports data/ statically through #data",
          )),
    );
  }

  if (active.bin) {
    const source = environment("bin");

    rules.push(
      ...createRule(
        source,
        [category("public-entries"), category("internal-aliases")],
        "test-variant",
        "allow",
        "bin commands are thin and use all of src",
      ),
      ...createRule(
        source,
        [category("bin")],
        "test-variant",
        "allow",
        "bin imports its own command tree",
      ),
      ...createRule(
        source,
        [category("scripts")],
        "test-variant",
        "forbid",
        "bin never imports scripts",
      ),
      ...createRule(
        source,
        [category("data")],
        "test-variant",
        "forbid",
        "bin never reads data/ directly",
      ),
      ...createRule(
        source,
        [category("tests")],
        "test-variant",
        "forbid",
        "no environment imports tests",
      ),
    );
  }

  if (active.scripts) {
    const source = environment("scripts");

    rules.push(
      ...createRule(
        source,
        [category("public-entries"), category("internal-aliases")],
        "test-variant",
        "allow",
        "scripts use all of src",
      ),
      ...createRule(
        source,
        [category("scripts")],
        "test-variant",
        "allow",
        "scripts import their own modules",
      ),
      ...createRule(
        source,
        [category("bin")],
        "test-variant",
        "forbid",
        "scripts never import bin",
      ),
      ...createRule(
        source,
        [category("tests")],
        "test-variant",
        "forbid",
        "no environment imports tests",
      ),
      ...createRule(
        source,
        [category("data")],
        "test-variant",
        "allow",
        "scripts read and write data/ by path (generated files)",
        { enforceable: false },
      ),
    );
  }

  if (active.tooling) {
    const source = environment("tooling");

    rules.push(
      ...createRule(
        source,
        [category("public-entries"), category("internal-aliases")],
        "test-variant",
        "allow",
        "tooling uses all of src",
      ),
      ...createRule(
        source,
        [category("bin"), category("scripts"), category("data")],
        "test-variant",
        "forbid",
        "tooling never imports bin, scripts or data/",
      ),
      ...createRule(
        source,
        [category("tests")],
        "test-variant",
        "forbid",
        "no environment imports tests",
      ),
    );
  }

  if (active.tests) {
    const spawn = createRule(
      environment("tests"),
      [category("bin")],
      "environment",
      "allow",
      "tests spawn bin commands",
      { enforceable: false },
    );

    if (published) {
      const plain = variant("plain");
      const source = variant("src");
      const dist = variant("dist");

      rules.push(
        ...spawn,
        ...createRule(
          environment("tests"),
          [category("data")],
          "environment",
          "allow",
          "a library's tests read data/ at runtime through the public specifier",
          { enforceable: false },
        ),
        ...createRule(
          plain,
          [category("public-entries"), category("tests"), category("scripts")],
          "test-variant",
          "allow",
          "x.test.ts runs in source and dist mode, so it imports the package name",
        ),
        ...createRule(
          plain,
          [category("internal-aliases"), category("bin")],
          "test-variant",
          "forbid",
          "x.test.ts never imports internals or bin modules; those belong to x.test.src.ts",
        ),
        ...createRule(
          source,
          [
            category("internal-aliases"),
            category("bin"),
            category("tests"),
            category("scripts"),
          ],
          "test-variant",
          "allow",
          "x.test.src.ts runs in source mode only and reaches internals through #… aliases",
        ),
        ...createRule(
          source,
          [category("public-entries")],
          "test-variant",
          "forbid",
          "x.test.src.ts never imports the package name",
        ),
        ...createRule(
          dist,
          [
            category("public-entries"),
            category("tests"),
            category("scripts"),
            category("dist-artefacts"),
          ],
          "test-variant",
          "allow",
          "x.test.dist.ts runs in dist mode only and may reach dist-only artefacts",
        ),
        ...createRule(
          dist,
          [category("internal-aliases"), category("bin")],
          "test-variant",
          "forbid",
          "x.test.dist.ts never imports internals or bin modules",
        ),
      );
    } else {
      rules.push(
        ...spawn,
        ...createRule(
          environment("tests"),
          [
            category("internal-aliases"),
            category("bin"),
            category("scripts"),
            category("tests"),
            category("data"),
          ],
          "environment",
          "allow",
          "an app's tests import everything through #… aliases",
        ),
      );
    }
  }

  return rules;
}

function collect(node: StructureNode): StructureNode[] {
  return [node, ...flatMap(node.children, collect)];
}

function indexOf({ path }: StructureNode, file: string): ImportRuleTarget {
  return {
    kind: "index",
    path,
    file,
  };
}

function resolveElementRules(
  structure: EnvironmentStructure,
  { roles }: ResolvedRoles,
): ImportRule[] {
  const rules: ImportRule[] = [];

  const fileGlobs = flatMap(entries(roles), ([name, { file }]) => {
    return file === undefined ? [] : [{ name, globs: wrap(file) }];
  });

  function filesOf(directory: string, only?: string): ImportRuleTarget[] {
    return fileGlobs
      .filter(({ name }) => {
        return only === undefined ? name !== indexRole : name === only;
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

  function surface(node: StructureNode): ImportRuleTarget[] {
    if (node.kind === "domain") {
      return [
        indexOf(node, structure.indexFile),
        ...rolesOf(node).filter(isPublic).map(modulesOf),
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
      rules.push(...createRule(source, targets, relation, "allow", reason));
    }

    for (const role of rolesOf(domain)) {
      const roleSource: ImportRuleSource = { kind: "element", path: role.path };

      if (role.role !== undefined && roles[role.role]?.typeOnly) {
        for (const { targets, relation, reason } of grants) {
          rules.push(
            ...createRule(
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
            ...createRule(roleSource, targets, relation, "allow", reason),
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
      ...createRule(
        { kind: "element", path: role.path },
        globalTargets,
        "global-roles",
        "allow",
        "global roles import only each other",
      ),
    );
  }

  visit(structure.root, { reaches: [], ancestors: [] });

  if (fileGlobs.some(({ name }) => name === indexRole)) {
    const surfaces = flatMap(
      collect(structure.root).filter(({ kind }) => kind === "domain"),
      surface,
    );

    for (const directory of structure.dirs) {
      rules.push(
        ...createRule(
          { kind: "file", path: join(directory, structure.indexFile) },
          globalTargets,
          "global-roles",
          "allow",
          "anything imports global roles",
        ),
        ...createRule(
          { kind: "file", path: join(directory, structure.indexFile) },
          surfaces,
          "root-entry",
          "allow",
          "the index.ts of an environment root imports any public surface",
        ),
      );
    }
  }

  return rules;
}

function resolveWorkspaceRules({
  workspaces,
  srcActive,
}: {
  workspaces: readonly {
    readonly dir: Directory;
    readonly dependencies: readonly Directory[];
  }[];
  srcActive: boolean;
}): ImportRule[] {
  function element(path: Directory): ImportRuleTarget {
    return { kind: "element", path };
  }

  return [
    ...(srcActive
      ? createRule(
          { kind: "environment", environment: "src" },
          workspaces.map(({ dir }) => element(dir)),
          "workspace",
          "forbid",
          "root src never imports a workspace",
        )
      : []),
    ...flatMap(workspaces, ({ dir, dependencies }) => {
      const source: ImportRuleSource = { kind: "element", path: dir };

      const others = workspaces.filter((other) => other.dir !== dir);

      return [
        ...createRule(
          source,
          others
            .filter((other) => dependencies.includes(other.dir))
            .map((other) => element(other.dir)),
          "workspace",
          "allow",
          "a workspace imports another through a declared dependency",
        ),
        ...createRule(
          source,
          others
            .filter((other) => !dependencies.includes(other.dir))
            .map((other) => element(other.dir)),
          "workspace",
          "forbid",
          "a workspace never imports a workspace that is not a declared dependency",
        ),
      ];
    }),
  ];
}

export function resolveImportRules({
  structures,
  roles,
  active,
  published,
  workspaces,
}: {
  structures: Partial<Record<StructureEnvironmentName, EnvironmentStructure>>;
  roles: Readonly<Record<RoleEnvironment, ResolvedRoles>>;
  active: Readonly<Record<StructureEnvironmentName, boolean>>;
  published: boolean;
  workspaces: readonly {
    readonly dir: Directory;
    readonly dependencies: readonly Directory[];
  }[];
}): readonly ImportRule[] {
  return freeze([
    ...resolveEnvironmentRules({
      active,
      published,
    }),
    ...resolveWorkspaceRules({ workspaces, srcActive: active.src }),
    ...flatMap(elementEnvironments, (name) => {
      const structure = structures[name];

      if (
        structure === undefined ||
        roles[name].roles[indexRole] === undefined
      ) {
        return [];
      }

      return flatMap(keys(structures), (environment) => {
        return createRule(
          { kind: "environment", environment },
          structure.dirs.map((directory): ImportRuleTarget => {
            return { kind: "file", path: join(directory, structure.indexFile) };
          }),
          "root-entry",
          "forbid",
          "nothing imports the index.ts of an environment root",
        );
      });
    }),
    ...flatMap(elementEnvironments, (name) => {
      const structure = structures[name];

      return structure === undefined
        ? []
        : resolveElementRules(structure, roles[name]);
    }),
  ]);
}
