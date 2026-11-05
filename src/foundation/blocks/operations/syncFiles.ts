import type { Filesystem } from "#foundation/filesystem/index";
import type { FileSync } from "#types/FileSync";

export function syncFiles(
  {
    filesystem,
    resolve,
  }: {
    filesystem: Filesystem;
    resolve(...paths: string[]): string;
  },
  files: readonly FileSync[],
) {
  for (const { file, update } of files) {
    const current = filesystem.read(file);

    if (current !== undefined) {
      filesystem.write(file, update(current, resolve(file)));
    }
  }
}
