import { posix } from "node:path";

import { looseObject, type GenericSchema, type InferOutput } from "valibot";

import { sort } from "@auaust/toolkit/array";
import { freeze, keys, mapValues, omit } from "@auaust/toolkit/object";

import {
  environmentMetadataFile,
  namespaceMetadataFile,
} from "#batiment/environments/constants";
import { environmentMetadataSchema } from "#batiment/environments/index";
import { workspaceMetadataSchema } from "#batiment/scopes/config/schemas/workspaceMetadataSchema";
import { rootScope, workspaceMetadataFile } from "#batiment/scopes/constants";
import { parseJson } from "#foundation/json/index";
import { validate } from "#foundation/options/index";
import type {
  StructureDiagnostic,
  StructureDiagnosticCode,
} from "#batiment/report/index";
import type { DiscoveredEnvironment } from "#batiment/scopes/types/DiscoveredEnvironment";
import type { DiscoveredWorkspace } from "#batiment/scopes/types/DiscoveredWorkspace";
import type { Filesystem } from "#foundation/filesystem/index";
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

async function readEnvironment({
  filesystem,
  file,
  scopes,
  kinds,
}: {
  filesystem: Filesystem;
  file: File;
  scopes: ReadonlySet<Directory>;
  kinds: ReadonlySet<string>;
}): Promise<{
  readonly environment?: DiscoveredEnvironment;
  readonly diagnostics: readonly StructureDiagnostic[];
}> {
  const dir = posix.dirname(file);
  const scope = posix.dirname(dir);

  if (dir === rootScope || scopes.has(dir) || !scopes.has(scope)) {
    return {
      diagnostics: [
        createDiagnostic(
          "misplaced-environment-metafile",
          file,
          `${file} lies outside a direct child directory of a scope; ignoring it`,
        ),
      ],
    };
  }

  const read = await readMetafile(filesystem, file, environmentMetadataSchema);

  if ("diagnostic" in read) {
    return { diagnostics: [read.diagnostic] };
  }

  const { metadata } = read;

  const diagnostics: StructureDiagnostic[] = [];

  const besideNamespace = await filesystem.exists(
    `${dir}/${namespaceMetadataFile}`,
  );

  if (besideNamespace) {
    diagnostics.push(
      createDiagnostic(
        "environment-metafile-beside-namespace",
        file,
        `${dir}/${namespaceMetadataFile} lies beside ${file}; keeping ${file}`,
      ),
    );
  }

  const kind = (
    metadata.kind ?? (scope === rootScope ? undefined : posix.basename(dir))
  );

  const known = kind === undefined || kinds.has(kind);

  if (!known) {
    diagnostics.push(
      createDiagnostic(
        "unknown-environment-kind",
        file,
        `${file} names the kind "${kind}", which no environment kind declares; ignoring the kind`,
      ),
    );
  }

  return {
    environment: freeze({
      dir,
      file,
      ...(kind === undefined || !known ? {} : { kind }),
      namespace: freeze(omit(metadata, "$schema", "kind")),
    }),
    diagnostics,
  };
}

export async function discoverWorkspaces({
  filesystem,
  ignored,
  kinds,
}: {
  filesystem: Filesystem;
  ignored: Globs;
  kinds: readonly string[];
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

  const known = new Set(kinds);

  const discovered = await Promise.all(
    files
      .filter((file) => posix.basename(file) === environmentMetadataFile)
      .map((file) => {
        return readEnvironment({
          filesystem,
          file,
          scopes,
          kinds: known,
        });
      }),
  );

  const environments: DiscoveredEnvironment[] = [];

  for (const { environment, diagnostics: found } of discovered) {
    diagnostics.push(...found);

    if (environment !== undefined) {
      environments.push(environment);
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
