import { mkdir } from "node:fs/promises";
import { dirname } from "node:path";

import { pointSymlink } from "#tools/pnpm/operations/pointSymlink";
import { listExecutableLinks } from "#tools/pnpm/utils/listExecutableLinks";
import type { PackageManifest } from "#tools/pnpm/types/PackageManifest";
import type { Directory } from "#types/Directory";

/**
 * Replaces the executables `root` installs for the package `manifest` describes
 * with symlinks through the package's symlink, so they run the package it points
 * at instead of the copy the install's shims name.
 */
// @debt only the POSIX executables are replaced: on Windows, pnpm's `.cmd` and `.ps1` shims keep running the installed copy
export async function pointPackageExecutables(
  root: Directory,
  manifest: PackageManifest,
): Promise<void> {
  for (const { path, target } of listExecutableLinks(root, manifest)) {
    await mkdir(dirname(path), { recursive: true });

    await pointSymlink(path, target, "file");
  }
}
