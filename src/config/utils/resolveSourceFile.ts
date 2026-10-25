import { existsSync } from "node:fs";

import { resolveWithin } from "#support/filesystem/utils/resolveWithin";
import type { Directory } from "#types/Directory";
import type { File } from "#types/File";

export function resolveSourceFile({
  root,
  configured,
  fallback,
}: {
  root: Directory;
  configured?: File | undefined;
  fallback: File;
}): File | undefined {
  if (configured === undefined) {
    const path = resolveWithin(root, fallback);

    return existsSync(path) ? path : undefined;
  }

  const path = resolveWithin(root, configured);

  if (!existsSync(path)) {
    throw new Error(`The configured ${configured} does not exist in ${root}`);
  }

  return path;
}
