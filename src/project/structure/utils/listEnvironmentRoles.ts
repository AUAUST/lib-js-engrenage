import {
  actions,
  commands,
  executable,
  index,
  type Role,
} from "#project/roles/index";
import type { ProgramLayout } from "#project/structure/types/ProgramLayout";

export function listEnvironmentRoles({
  environment,
  tree,
  roles = [],
  omitRoles = [],
  defaults,
}: {
  environment: string;
  tree?: ProgramLayout | undefined;
  roles?: readonly Role[] | undefined;
  omitRoles?: readonly string[] | undefined;
  defaults: readonly Role[];
}): readonly Role[] {
  const defaultNames = new Set(defaults.map(({ name }) => name));

  const unknown = omitRoles.find((name) => !defaultNames.has(name));

  if (unknown !== undefined) {
    throw new Error(
      `\`${environment}.omitRoles\` drops "${unknown}", which is no default role of ${environment}: ${[...defaultNames].join(", ")}`,
    );
  }

  const listed = new Set(roles.map(({ name }) => name));

  const configured = [
    ...defaults.filter(({ name }) => {
      return !omitRoles.includes(name) && !listed.has(name);
    }),
    ...roles,
  ];

  if (tree !== "commands") {
    return configured;
  }

  const named = new Set(configured.map(({ name }) => name));

  return [
    ...configured,
    ...[index(), executable(), commands(), actions()].filter(({ name }) => {
      return !named.has(name);
    }),
  ];
}
