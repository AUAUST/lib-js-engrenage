import { posix } from "node:path";

import { looseObject } from "valibot";

import { sort } from "@auaust/toolkit/array";
import { freeze, keys, mapValues, omit } from "@auaust/toolkit/object";

import { workspaceMetadataSchema } from "#batiment/scopes/config/schemas/workspaceMetadataSchema";
import { workspaceMetadataFile } from "#batiment/scopes/constants";
import { parseJson } from "#foundation/json/index";
import { validate } from "#foundation/options/index";
import type { StructureDiagnostic } from "#batiment/report/index";
import type { DiscoveredWorkspace } from "#batiment/scopes/types/DiscoveredWorkspace";
import type { Filesystem } from "#foundation/filesystem/index";
import type { File } from "#types/File";
import type { Globs } from "#types/Globs";

const fields = workspaceMetadataSchema.entries;

const metadataSchema = looseObject(mapValues(fields, ({ schema }) => schema));

function createDiagnostic(
  code: "unreadable-metafile" | "invalid-metafile",
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

async function readWorkspace(
  filesystem: Filesystem,
  file: File,
): Promise<DiscoveredWorkspace | StructureDiagnostic> {
  const text = await filesystem.read(file);

  if (text === undefined) {
    return createDiagnostic(
      "unreadable-metafile",
      file,
      `${file} was listed but cannot be read; ignoring it`,
    );
  }

  let content: unknown;

  try {
    content = parseJson(text, file);
  } catch (error) {
    if (!(error instanceof Error)) {
      throw error;
    }

    return createDiagnostic(
      "unreadable-metafile",
      file,
      `${file} is ignored: ${error.message}`,
    );
  }

  try {
    const metadata = validate(metadataSchema, content, file);

    return freeze({
      dir: posix.dirname(file),
      file,
      ...(metadata.purpose === undefined ? {} : { purpose: metadata.purpose }),
      remainder: freeze(omit(metadata, ...keys(fields))),
    });
  } catch (error) {
    if (!(error instanceof Error)) {
      throw error;
    }

    return createDiagnostic(
      "invalid-metafile",
      file,
      `${file} is ignored: ${error.message}`,
    );
  }
}

export async function discoverWorkspaces({
  filesystem,
  ignored,
}: {
  filesystem: Filesystem;
  ignored: Globs;
}): Promise<{
  readonly workspaces: readonly DiscoveredWorkspace[];
  readonly diagnostics: readonly StructureDiagnostic[];
}> {
  const files = await filesystem.glob(`*/**/${workspaceMetadataFile}`, {
    exclude: [...ignored, "**/node_modules"],
  });

  const read = await Promise.all(
    files.map((file) => {
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

  return freeze({
    workspaces: freeze(
      sort(workspaces, (left, right) => left.dir.localeCompare(right.dir)),
    ),
    diagnostics: freeze(diagnostics),
  });
}
