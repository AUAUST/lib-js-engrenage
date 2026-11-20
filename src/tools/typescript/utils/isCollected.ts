import type { ResolvedRoleContract } from "#batiment/roles/index";

export function isCollected(
  contract: ResolvedRoleContract | undefined,
): contract is ResolvedRoleContract {
  return (
    contract !== undefined &&
    contract.collected &&
    contract.public &&
    contract.subpath !== true
  );
}
