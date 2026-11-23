import type { Role } from "#batiment/roles/types/Role";

export function listNamespaceRoles({
  namespace,
  layoutRoles = [],
  roles = [],
  omitRoles = [],
  defaults,
}: {
  namespace: string;
  layoutRoles?: readonly Role[] | undefined;
  roles?: readonly Role[] | undefined;
  omitRoles?: readonly string[] | undefined;
  defaults: readonly Role[];
}): readonly Role[] {
  const defaultNames = new Set(defaults.map(({ name }) => name));

  const unknown = omitRoles.find((name) => !defaultNames.has(name));

  if (unknown !== undefined) {
    throw new Error(
      `\`${namespace}.omitRoles\` drops "${unknown}", which is no default role of ${namespace}: ${[...defaultNames].join(", ")}`,
    );
  }

  const listed = new Set(roles.map(({ name }) => name));

  const configured = [
    ...defaults.filter(({ name }) => {
      return !omitRoles.includes(name) && !listed.has(name);
    }),
    ...roles,
  ];

  const named = new Set(configured.map(({ name }) => name));

  return [
    ...configured,
    ...layoutRoles.filter(({ name }) => {
      return !named.has(name);
    }),
  ];
}
