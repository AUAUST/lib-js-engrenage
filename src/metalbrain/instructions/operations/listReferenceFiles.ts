import { backlogIndex } from "#metalbrain/backlog/constants";
import type { Filesystem } from "#foundation/filesystem/index";
import type { File } from "#types/File";
import type { Globs } from "#types/Globs";

/**
 * The files whose `@reference` markers engrenage fills and migrates: the
 * instruction files and the backlog index.
 */
export async function listReferenceFiles({
  filesystem,
  instructionFiles,
}: {
  filesystem: Filesystem;
  instructionFiles: Globs;
}): Promise<readonly File[]> {
  const files = await filesystem.glob(instructionFiles);

  return (await filesystem.exists(backlogIndex))
    ? [...files, backlogIndex]
    : files;
}
