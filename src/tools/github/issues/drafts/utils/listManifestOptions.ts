import type { ManifestTarget } from "#tools/github/issues/drafts/types/ManifestTarget";

export function listManifestOptions(
  labels: readonly string[],
  fields: ManifestTarget["types"][number]["fields"],
): ReadonlyMap<string, readonly string[]> {
  return new Map([
    ["labels", labels],
    ...fields
      .filter(({ options }) => options.length > 0)
      .map(({ name, options }) => {
        return [name, options.map((option) => option.name)] as const;
      }),
  ]);
}
