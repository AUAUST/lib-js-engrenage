import type { ResolvedRoleContract } from "#project/structure/index";

export function isCollected(
  contract: ResolvedRoleContract | undefined,
): contract is ResolvedRoleContract {
  return (
    contract !== undefined &&
    contract.collected &&
    contract.public &&
    !contract.subpath
  );
}
