import type { ManifestTarget } from "#tools/github/issues/drafts/types/ManifestTarget";

export function findTypeNodeId(target: ManifestTarget, name: string): string {
  const type = target.types.find((candidate) => candidate.name === name);

  if (type === undefined) {
    throw new Error(`The GitHub snapshot has no enabled type ${name}`);
  }

  return type.nodeId;
}
