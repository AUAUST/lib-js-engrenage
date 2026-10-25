import { readPackageSnapshot } from "#tsdown/utils/readPackageSnapshot";
import type { File } from "#types/File";

export function assertPackageUnchanged(path: File, snapshot: string) {
  if (readPackageSnapshot(path) !== snapshot) {
    throw new Error(
      `${path} changed during the build: build locally and commit the regenerated file`,
    );
  }
}
