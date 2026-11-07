import type { NamedFileRole } from "#project/structure/types/NamedFileRole";

export function constrainsFileRole({ contract }: NamedFileRole): boolean {
  return contract.unique || contract.required;
}
