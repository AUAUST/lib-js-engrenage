import type { ResolvedRoleContract } from "#batiment/roles/index";

export function isPublicRole(
  role: string | undefined,
  contract: ResolvedRoleContract | undefined,
  publicRoles: readonly string[],
): boolean {
  return (
    contract?.public === true ||
    (role !== undefined && publicRoles.includes(role))
  );
}
