import {
  actions,
  commands,
  executable,
  index,
  type Role,
} from "#project/roles/index";
import type { ProgramLayout } from "#project/structure/types/ProgramLayout";

export function listEnvironmentRoles({
  tree,
  roles,
}: {
  tree?: ProgramLayout | undefined;
  roles?: readonly Role[] | undefined;
}): readonly Role[] | undefined {
  if (tree !== "commands") {
    return roles;
  }

  const listed = new Set(roles?.map(({ name }) => name));

  return [
    ...(roles ?? []),
    ...[index(), executable(), commands(), actions()].filter(({ name }) => {
      return !listed.has(name);
    }),
  ];
}
