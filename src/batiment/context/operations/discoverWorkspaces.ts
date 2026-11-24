import { posix } from "node:path";

import { looseObject, type GenericSchema, type InferOutput } from "valibot";

import { sort } from "@auaust/toolkit/array";
import { freeze, keys, mapValues, omit } from "@auaust/toolkit/object";

import { environmentMetadataFile } from "#batiment/environments/constants";
import {
  environmentMetadataSchema,
  type DiscoveredEnvironment,
} from "#batiment/environments/index";
import {
  namespaceMetadataFile,
  rootScope,
  workspaceMetadataFile,
} from "#batiment/scopes/constants";
import {
  namespaceMetadataSchema,
  workspaceMetadataSchema,
  type DiscoveredNamespace,
  type DiscoveredWorkspace,
} from "#batiment/scopes/index";
import { filesIn, type Filesystem } from "#foundation/filesystem/index";
import { parseJson } from "#foundation/json/index";
import { validate } from "#foundation/options/index";
import type {
  StructureDiagnostic,
  StructureDiagnosticCode,
} from "#batiment/report/index";
import type { Directories } from "#types/Directories";
import type { Directory } from "#types/Directory";
import type { File } from "#types/File";
import type { Globs } from "#types/Globs";

const fields = workspaceMetadataSchema.entries;

const metadataSchema = looseObject(mapValues(fields, ({ schema }) => schema));

function createDiagnostic(
  code: StructureDiagnosticCode,
  file: File,
  message: string,
): StructureDiagnostic {
  return freeze({
    severity: "error",
    code,
    message,
    path: posix.dirname(file),
    files: freeze([file]),
  });
}

async function readMetafile<Schema extends GenericSchema>(
  filesystem: Filesystem,
  file: File,
  schema: Schema,
): Promise<
  | { readonly metadata: InferOutput<Schema> }
  | { readonly diagnostic: StructureDiagnostic }
> {
  const text = await filesystem.read(file);

  if (text === undefined) {
    return {
      diagnostic: createDiagnostic(
        "unreadable-metafile",
        file,
        `${file} was listed but cannot be read; ignoring it`,
      ),
    };
  }

  let content: unknown;

  try {
    content = parseJson(text, file);
  } catch (error) {
    if (!(error instanceof Error)) {
      throw error;
    }

    return {
      diagnostic: createDiagnostic(
        "unreadable-metafile",
        file,
        `${file} is ignored: ${error.message}`,
      ),
    };
  }

  try {
    return { metadata: validate(schema, content, file) };
  } catch (error) {
    if (!(error instanceof Error)) {
      throw error;
    }

    return {
      diagnostic: createDiagnostic(
        "invalid-metafile",
        file,
        `${file} is ignored: ${error.message}`,
      ),
    };
  }
}

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
    return createDiagnostic(
      "misplaced-environment-metafile",
      file,
      `${file} lies at a scope's root, which no metafile may place an environment on; ignoring it`,
    );
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

async function readNamespace(
  filesystem: Filesystem,
  file: File,
): Promise<DiscoveredNamespace | StructureDiagnostic> {
  const read = await readMetafile(filesystem, file, namespaceMetadataSchema);

  if ("diagnostic" in read) {
    return read.diagnostic;
  }

  const { kind } = read.metadata;

  return freeze({
    dir: posix.dirname(file),
    file,
    ...(kind === undefined ? {} : { kind }),
  });
}

/**
 * Discovers the workspaces, the `.environment.json` metafiles but those at a
 * scope's root, and the `.namespace.json` metafiles of top-level namespaces: those
 * in `dirs`, the root's, and those in each workspace's direct child directories.
 */
export async function discoverWorkspaces({
  filesystem,
  ignored,
  dirs,
}: {
  filesystem: Filesystem;
  ignored: Globs;
  dirs: Directories;
}): Promise<{
  readonly workspaces: readonly DiscoveredWorkspace[];
  readonly environments: readonly DiscoveredEnvironment[];
  readonly namespaces: readonly DiscoveredNamespace[];
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

  const namespaceFiles = await filesystem.glob(
    [
      ...filesIn(
        dirs.filter((dir) => dir !== rootScope),
        namespaceMetadataFile,
      ),
      ...filesIn(
        workspaces.map(({ dir }) => dir),
        `*/${namespaceMetadataFile}`,
      ),
    ],
    { exclude: [...ignored, "**/node_modules"] },
  );

  const namespaces: DiscoveredNamespace[] = [];

  for (const result of await Promise.all(
    namespaceFiles.map((file) => readNamespace(filesystem, file)),
  )) {
    if ("code" in result) {
      diagnostics.push(result);
    } else {
      namespaces.push(result);
    }
  }

  return freeze({
    workspaces: freeze(
      sort(workspaces, (left, right) => left.dir.localeCompare(right.dir)),
    ),
    environments: freeze(environments),
    namespaces: freeze(namespaces),
    diagnostics: freeze(diagnostics),
  });
}
