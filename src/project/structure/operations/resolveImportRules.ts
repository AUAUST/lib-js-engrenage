import { join } from "node:path";

import { flatMap } from "@auaust/primitive-kit/arrays";
import { freeze, keys } from "@auaust/toolkit/object";

import { elementEnvironments } from "#project/structure/constants";
import { createImportRule } from "#project/structure/utils/createImportRule";
import { getEnvironmentRootRole } from "#project/structure/utils/getEnvironmentRootRole";
import { resolveElementImportRules } from "#project/structure/utils/resolveElementImportRules";
import { resolveEnvironmentImportRules } from "#project/structure/utils/resolveEnvironmentImportRules";
import type { EnvironmentStructure } from "#project/structure/types/EnvironmentStructure";
import type { ImportRule } from "#project/structure/types/ImportRule";
import type { ImportRuleSource } from "#project/structure/types/ImportRuleSource";
import type { ImportRuleTarget } from "#project/structure/types/ImportRuleTarget";
import type { ResolvedRoles } from "#project/structure/types/ResolvedRoles";
import type { RoleEnvironment } from "#project/structure/types/RoleEnvironment";
import type { StructureEnvironmentName } from "#project/structure/types/StructureEnvironmentName";
import type { Directory } from "#types/Directory";

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
      ? createImportRule(
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
        ...createImportRule(
          source,
          others
            .filter((other) => dependencies.includes(other.dir))
            .map((other) => element(other.dir)),
          "workspace",
          "allow",
          "a workspace imports another through a declared dependency",
        ),
        ...createImportRule(
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
    ...resolveEnvironmentImportRules({
      active,
      published,
    }),
    ...resolveWorkspaceRules({ workspaces, srcActive: active.src }),
    ...flatMap(elementEnvironments, (name) => {
      const structure = structures[name];

      const root =
        structure === undefined
          ? undefined
          : getEnvironmentRootRole(structure, roles[name].roles);

      if (structure === undefined || root === undefined) {
        return [];
      }

      return flatMap(keys(structures), (environment) => {
        return createImportRule(
          { kind: "environment", environment },
          structure.dirs.map((directory): ImportRuleTarget => {
            return { kind: "file", path: join(directory, root.file) };
          }),
          "root-entry",
          "forbid",
          `nothing imports the ${root.file} of an environment root`,
        );
      });
    }),
    ...flatMap(elementEnvironments, (name) => {
      const structure = structures[name];

      return structure === undefined
        ? []
        : resolveElementImportRules(structure, roles[name]);
    }),
  ]);
}
