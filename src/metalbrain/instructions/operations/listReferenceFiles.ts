import type { Filesystem } from "#foundation/filesystem/index";
import type { File } from "#types/File";
import type { Globs } from "#types/Globs";

/**
 * The files whose `@reference` markers engrenage fills and migrates: the
 * instruction files.
 */
export function listReferenceFiles({
  filesystem,
  instructionFiles,
}: {
  filesystem: Filesystem;
  instructionFiles: Globs;
}): Promise<readonly File[]> {
  return filesystem.glob(instructionFiles);
}
