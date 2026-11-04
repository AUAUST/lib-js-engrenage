import { resolveWithin } from "#foundation/filesystem/utils/resolveWithin";
import type { Filesystem } from "#foundation/filesystem/types/Filesystem";
import type { Directory } from "#types/Directory";
import type { File } from "#types/File";

export function locateFile(
  { root, filesystem }: { root: Directory; filesystem: Filesystem },
  file: File,
  configured: boolean,
): File | undefined {
  if (!configured) {
    return filesystem.exists(file) ? resolveWithin(root, file) : undefined;
  }

  if (!filesystem.exists(file)) {
    throw new Error(`The configured ${file} does not exist in ${root}`);
  }

  return resolveWithin(root, file);
}
