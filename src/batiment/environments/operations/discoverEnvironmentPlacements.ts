import { freeze, record } from "@auaust/toolkit/object";

import type { EnvironmentPlacements } from "#batiment/environments/types/EnvironmentPlacements";
import type { RegisteredEnvironment } from "#batiment/environments/types/RegisteredEnvironment";
import type { StructureDiagnostic } from "#batiment/report/index";
import type { Filesystem } from "#foundation/filesystem/index";
import type { Directory } from "#types/Directory";
import type { File } from "#types/File";
import type { Globs } from "#types/Globs";

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

/**
 * Places each registered environment on its directories and on the root files
 * its `files` globs match, keeping the first in registration order where two
 * place one directory or file, each such clash an error diagnostic.
 */
export async function discoverEnvironmentPlacements({
  registered,
  ignored,
  filesystem,
}: {
  registered: readonly RegisteredEnvironment[];
  ignored: Globs;
  filesystem: Filesystem;
}): Promise<{
  readonly placements: EnvironmentPlacements;
  readonly diagnostics: readonly StructureDiagnostic[];
}> {
  const globbed = await Promise.all(
    registered.map(async ({ registration: { files } }) => {
      return files.length === 0
        ? []
        : filesystem.glob(files, { exclude: ignored });
    }),
  );

  const dirs = new Map<Directory, string>();
  const files = new Map<File, string>();
  const diagnostics: StructureDiagnostic[] = [];

  for (const [index, { registration, dirs: placed }] of registered.entries()) {
    const { name } = registration;

    for (const dir of placed) {
      const kept = dirs.get(dir);

      if (kept === undefined) {
        dirs.set(dir, name);
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

  return freeze({
    placements: freeze({
      dirs: freeze(record([...dirs])),
      files: freeze(record([...files])),
    }),
    diagnostics: freeze(diagnostics),
  });
}
