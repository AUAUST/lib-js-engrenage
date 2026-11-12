import { barrelHeader } from "#tools/typescript/constants";
import type { Filesystem } from "#foundation/filesystem/index";
import type { File } from "#types/File";

export async function isGeneratedBarrel(
  filesystem: Filesystem,
  file: File,
): Promise<boolean> {
  const content = await filesystem.read(file);

  return content?.startsWith(barrelHeader) === true;
}
