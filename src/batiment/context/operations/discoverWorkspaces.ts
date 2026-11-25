import { posix } from "node:path";

import { looseObject } from "valibot";

import { sort } from "@auaust/toolkit/array";
import { freeze, keys, mapValues, omit } from "@auaust/toolkit/object";

import { readMetafile } from "#batiment/context/operations/readMetafile";
import { environmentMetadataFile } from "#batiment/environments/constants";
import {
  environmentMetadataSchema,
  type DiscoveredEnvironment,
} from "#batiment/environments/index";
import { rootScope, workspaceMetadataFile } from "#batiment/scopes/constants";
import {
  workspaceMetadataSchema,
  type DiscoveredWorkspace,
} from "#batiment/scopes/index";
import type { StructureDiagnostic } from "#batiment/report/index";
import type { Filesystem } from "#foundation/filesystem/index";
import type { Directory } from "#types/Directory";
import type { File } from "#types/File";
import type { Globs } from "#types/Globs";

const fields = workspaceMetadataSchema.entries;

const metadataSchema = looseObject(mapValues(fields, ({ schema }) => schema));

async function readWorkspace(
  filesystem: Filesystem,
  file: File,
): Promise<DiscoveredWorkspace | StructureDiagnostic> {
  const read = await readMetafile(filesystem, file, metadataSchema);

  if ("diagnostic" in read) {
    return read.diagnostic;
  }

  const { metadata } = read;

  return freeze({
    dir: posix.dirname(file),
    file,
    ...(metadata.purpose === undefined ? {} : { purpose: metadata.purpose }),
    ...(metadata.debt === undefined ? {} : { debt: metadata.debt }),
    remainder: freeze(omit(metadata, ...keys(fields))),
  });
}

async function readEnvironment(
  filesystem: Filesystem,
  file: File,
  scopes: ReadonlySet<Directory>,
): Promise<DiscoveredEnvironment | StructureDiagnostic> {
  const dir = posix.dirname(file);

  if (scopes.has(dir)) {
    return freeze({
      severity: "error",
      code: "misplaced-environment-metafile",
      message: `${file} lies at a scope's root, which no metafile may place an environment on; ignoring it`,
      path: dir,
      files: freeze([file]),
    });
  }

  const read = await readMetafile(filesystem, file, environmentMetadataSchema);

  if ("diagnostic" in read) {
    return read.diagnostic;
  }

  return freeze({
    dir,
    file,
    environment: read.metadata.environment,
  });
}

/**
 * Discovers the workspaces and the `.environment.json` metafiles but those
 * at a scope's root.
 */
export async function discoverWorkspaces({
  filesystem,
  ignored,
}: {
  filesystem: Filesystem;
  ignored: Globs;
}): Promise<{
  readonly workspaces: readonly DiscoveredWorkspace[];
  readonly environments: readonly DiscoveredEnvironment[];
  readonly diagnostics: readonly StructureDiagnostic[];
}> {
  const files = await filesystem.glob(
    [`*/**/${workspaceMetadataFile}`, `**/${environmentMetadataFile}`],
    { exclude: [...ignored, "**/node_modules"] },
  );

  const read = await Promise.all(
    files
      .filter((file) => posix.basename(file) === workspaceMetadataFile)
      .map((file) => {
        return readWorkspace(filesystem, file);
      }),
  );

  const workspaces: DiscoveredWorkspace[] = [];
  const diagnostics: StructureDiagnostic[] = [];

  for (const result of read) {
    if ("code" in result) {
      diagnostics.push(result);
    } else {
      workspaces.push(result);
    }
  }

  const scopes = new Set([rootScope, ...workspaces.map(({ dir }) => dir)]);

  const discovered = await Promise.all(
    files
      .filter((file) => posix.basename(file) === environmentMetadataFile)
      .map((file) => readEnvironment(filesystem, file, scopes)),
  );

  const environments: DiscoveredEnvironment[] = [];

  for (const result of discovered) {
    if ("code" in result) {
      diagnostics.push(result);
    } else {
      environments.push(result);
    }
  }

  return freeze({
    workspaces: freeze(
      sort(workspaces, (left, right) => left.dir.localeCompare(right.dir)),
    ),
    environments: freeze(environments),
    diagnostics: freeze(diagnostics),
  });
}
