import { Minimatch } from "minimatch";

import { freeze, record } from "@auaust/toolkit/object";

import { findDirectories, type Filesystem } from "#foundation/filesystem/index";
import type { DiscoveredEnvironment } from "#batiment/environments/types/DiscoveredEnvironment";
import type { EnvironmentPlacements } from "#batiment/environments/types/EnvironmentPlacements";
import type { RegisteredEnvironment } from "#batiment/environments/types/RegisteredEnvironment";
import type { StructureDiagnostic } from "#batiment/report/index";
import type { Directories } from "#types/Directories";
import type { Directory } from "#types/Directory";
import type { File } from "#types/File";
import type { Globs } from "#types/Globs";

async function expandDirectories(
  dirs: Directories,
  ignored: Globs,
  filesystem: Filesystem,
): Promise<Directories> {
  const expanded = await Promise.all(
    dirs.map(async (dir) => {
      if (!new Minimatch(dir).hasMagic()) {
        return [dir];
      }

      const matched = await filesystem.glob(dir, { exclude: ignored });

      return findDirectories(filesystem, matched);
    }),
  );

  return expanded.flat();
}

function createConflict(
  rank: "directory" | "file",
  path: string,
  kept: string,
  dropped: string,
): StructureDiagnostic {
  return freeze({
    severity: "error",
    code: "environment-placement-conflict",
    message: `The ${rank} ${path} is placed with both the ${kept} and the ${dropped} environments: ${kept} is kept; place one environment on it`,
    ...(rank === "directory" ? { path } : {}),
    files: freeze(rank === "file" ? [path] : []),
  });
}

function placeMetafiles({
  metafiles,
  registered,
  dirs,
  sources,
  diagnostics,
}: {
  metafiles: readonly DiscoveredEnvironment[];
  registered: readonly RegisteredEnvironment[];
  dirs: Map<Directory, string>;
  sources: ReadonlyMap<Directory, RegisteredEnvironment>;
  diagnostics: StructureDiagnostic[];
}): void {
  const names = new Set(registered.map(({ registration: { name } }) => name));

  for (const { dir, file, environment } of metafiles) {
    if (!names.has(environment)) {
      diagnostics.push(
        freeze({
          severity: "error",
          code: "unknown-environment",
          message: `${file} names the environment "${environment}", which no registration holds; ignoring it`,
          path: dir,
          files: freeze([file]),
        }),
      );

      continue;
    }

    const config = sources.get(dir)?.registration.dirsSource;

    if (config?.origin?.layer === "input") {
      diagnostics.push(
        freeze({
          severity: "error",
          code: "config-metafile-conflict",
          message: `${dir} is placed by both ${config.path} and ${file}; keeping the placement of ${file}`,
          path: dir,
          files: freeze([file]),
          config,
        }),
      );
    }

    dirs.set(dir, environment);
  }
}

/**
 * Places each registered environment on its directories, a glob placing it on each
 * directory it matches, and on the root files its `files` globs match, keeping
 * the first in registration order where two place one directory or file, each
 * such clash an error diagnostic; then on each directory an `.environment.json`
 * names it on, replacing the config's placement there, an error diagnostic when
 * the config input sets it.
 */
export async function discoverEnvironmentPlacements({
  registered,
  metafiles,
  ignored,
  filesystem,
}: {
  registered: readonly RegisteredEnvironment[];
  metafiles: readonly DiscoveredEnvironment[];
  ignored: Globs;
  filesystem: Filesystem;
}): Promise<{
  readonly placements: EnvironmentPlacements;
  readonly diagnostics: readonly StructureDiagnostic[];
}> {
  const expanded = await Promise.all(
    registered.map(({ dirs }) => expandDirectories(dirs, ignored, filesystem)),
  );

  const globbed = await Promise.all(
    registered.map(async ({ registration: { files } }) => {
      return files.length === 0
        ? []
        : filesystem.glob(files, { exclude: ignored });
    }),
  );

  const dirs = new Map<Directory, string>();
  const sources = new Map<Directory, RegisteredEnvironment>();
  const files = new Map<File, string>();
  const diagnostics: StructureDiagnostic[] = [];

  for (const [index, environment] of registered.entries()) {
    const { name } = environment.registration;

    for (const dir of expanded[index] ?? []) {
      const kept = dirs.get(dir);

      if (kept === undefined) {
        dirs.set(dir, name);

        sources.set(dir, environment);
      } else if (kept !== name) {
        diagnostics.push(createConflict("directory", dir, kept, name));
      }
    }

    for (const file of globbed[index] ?? []) {
      const kept = files.get(file);

      if (kept === undefined) {
        files.set(file, name);
      } else if (kept !== name) {
        diagnostics.push(createConflict("file", file, kept, name));
      }
    }
  }

  placeMetafiles({
    metafiles,
    registered,
    dirs,
    sources,
    diagnostics,
  });

  return freeze({
    placements: freeze({
      dirs: freeze(record([...dirs])),
      files: freeze(record([...files])),
    }),
    diagnostics: freeze(diagnostics),
  });
}
