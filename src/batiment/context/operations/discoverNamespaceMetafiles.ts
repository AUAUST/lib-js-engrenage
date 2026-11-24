import { posix } from "node:path";

import { freeze } from "@auaust/toolkit/object";

import { readMetafile } from "#batiment/context/operations/readMetafile";
import { namespaceMetadataFile } from "#batiment/scopes/constants";
import {
  namespaceMetadataSchema,
  type DiscoveredNamespace,
} from "#batiment/scopes/index";
import { filesIn, type Filesystem } from "#foundation/filesystem/index";
import type { StructureDiagnostic } from "#batiment/report/index";
import type { Directories } from "#types/Directories";
import type { File } from "#types/File";
import type { Globs } from "#types/Globs";

async function readNamespace(
  filesystem: Filesystem,
  file: File,
): Promise<DiscoveredNamespace | StructureDiagnostic> {
  const read = await readMetafile(filesystem, file, namespaceMetadataSchema);

  if ("diagnostic" in read) {
    return read.diagnostic;
  }

  const { kind, imports } = read.metadata;

  return freeze({
    dir: posix.dirname(file),
    file,
    ...(kind === undefined ? {} : { kind }),
    ...(imports === undefined ? {} : { imports: freeze(imports) }),
  });
}

/**
 * Discovers the `.namespace.json` metafiles of the top-level namespaces
 * placed on `dirs`.
 */
export async function discoverNamespaceMetafiles({
  filesystem,
  ignored,
  dirs,
}: {
  filesystem: Filesystem;
  ignored: Globs;
  dirs: Directories;
}): Promise<{
  readonly namespaces: readonly DiscoveredNamespace[];
  readonly diagnostics: readonly StructureDiagnostic[];
}> {
  const files = await filesystem.glob(filesIn(dirs, namespaceMetadataFile), {
    exclude: [...ignored, "**/node_modules"],
  });

  const namespaces: DiscoveredNamespace[] = [];
  const diagnostics: StructureDiagnostic[] = [];

  for (const result of await Promise.all(
    files.map((file) => readNamespace(filesystem, file)),
  )) {
    if ("code" in result) {
      diagnostics.push(result);
    } else {
      namespaces.push(result);
    }
  }

  return freeze({
    namespaces: freeze(namespaces),
    diagnostics: freeze(diagnostics),
  });
}
