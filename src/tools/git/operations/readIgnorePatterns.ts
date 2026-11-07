import type { Filesystem } from "#foundation/filesystem/index";
import type { File } from "#types/File";
import type { Globs } from "#types/Globs";

export async function readIgnorePatterns(
  filesystem: Filesystem,
  file: File,
): Promise<Globs> {
  const content = await filesystem.read(file);

  return (
    content?.split(/\r?\n/u).filter((line) => {
      return line.trim() !== "" && !line.startsWith("#");
    }) ?? []
  );
}
