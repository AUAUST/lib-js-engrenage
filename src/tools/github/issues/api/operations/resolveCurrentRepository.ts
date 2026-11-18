import { readManifestRepository } from "#tools/github/issues/api/operations/readManifestRepository";
import { readOriginRepository } from "#tools/github/issues/api/operations/readOriginRepository";
import type { Directory } from "#types/Directory";

export async function resolveCurrentRepository(
  root: Directory,
): Promise<string | undefined> {
  return (
    (await readManifestRepository(root)) ?? (await readOriginRepository(root))
  );
}
