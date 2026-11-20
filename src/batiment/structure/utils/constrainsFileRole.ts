import type { NamedFileRole } from "#batiment/structure/types/NamedFileRole";

export function constrainsFileRole({ contract }: NamedFileRole): boolean {
  return contract.unique || contract.required;
}
