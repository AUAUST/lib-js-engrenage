import type { ResolvedConfig } from "#config/types/ResolvedConfig";
import type { FileSync } from "#types/FileSync";

export function syncFiles(
  { filesystem, resolve }: ResolvedConfig,
  files: ReadonlyArray<FileSync>,
) {
  for (const { file, update } of files) {
    const current = filesystem.read(file);

    if (current !== undefined) {
      filesystem.write(file, update(current, resolve(file)));
    }
  }
}
