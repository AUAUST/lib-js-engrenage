import type { Filesystem } from "#foundation/filesystem/index";
import type { FileSync } from "#types/FileSync";

export async function syncFiles(
  {
    filesystem,
    resolve,
  }: {
    filesystem: Filesystem;
    resolve(...paths: string[]): string;
  },
  files: readonly FileSync[],
) {
  await Promise.all(
    files.map(async ({ file, update }) => {
      const current = await filesystem.read(file);

      if (current !== undefined) {
        await filesystem.write(file, update(current, resolve(file)));
      }
    }),
  );
}
