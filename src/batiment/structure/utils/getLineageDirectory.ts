import type { LineageMember } from "#batiment/structure/types/LineageMember";

export function getLineageDirectory(
  lineage: readonly LineageMember[],
): LineageMember | undefined {
  const [, directory] = lineage;

  return directory?.kind === "directory" ? directory : undefined;
}
