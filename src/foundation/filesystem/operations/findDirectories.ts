import type { Filesystem } from "#foundation/filesystem/types/Filesystem";
import type { Directories } from "#types/Directories";

export async function findDirectories(
  filesystem: Filesystem,
  directories: Directories,
): Promise<Directories> {
  const found = await Promise.all(
    directories.map((directory) => filesystem.isDirectory(directory)),
  );

  return directories.filter((_, index) => found[index]);
}
