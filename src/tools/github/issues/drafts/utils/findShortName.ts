import type { DraftsContext } from "#tools/github/issues/drafts/types/DraftsContext";

export function findShortName(
  repository: string,
  { registry }: Pick<DraftsContext, "registry">,
): string | undefined {
  const name = repository.toLowerCase();

  return [...registry].find(([, registered]) => {
    return registered.toLowerCase() === name;
  })?.[0];
}
