import { posix } from "node:path";

import { deepEquals } from "@auaust/toolkit/general";
import { freeze } from "@auaust/toolkit/object";

import type { StructureDiagnostic } from "#batiment/report/index";
import type { DiscoveredNamespace } from "#batiment/scopes/types/DiscoveredNamespace";
import type { File } from "#types/File";

type MetafileField = Exclude<keyof DiscoveredNamespace, "dir" | "file">;

/**
 * Finds the value a top-level namespace's `.namespace.json` files set for a
 * field: the first file setting it wins, and another setting a different value
 * is reported as a `metafile-field-conflict`.
 */
export function findMetafileField<Field extends MetafileField>({
  metafiles,
  field,
  diagnostics,
}: {
  metafiles: readonly Pick<DiscoveredNamespace, "file" | Field>[];
  field: Field;
  diagnostics: StructureDiagnostic[];
}):
  | {
      readonly value: NonNullable<DiscoveredNamespace[Field]>;
      readonly file: File;
    }
  | undefined {
  let found:
    | {
        readonly value: NonNullable<DiscoveredNamespace[Field]>;
        readonly file: File;
      }
    | undefined;

  for (const metafile of metafiles) {
    const { file } = metafile;
    const value = metafile[field];

    if (value == null) {
      continue;
    }

    if (found === undefined) {
      found = { value, file };
    } else if (!deepEquals(found.value, value)) {
      diagnostics.push(
        freeze({
          severity: "error",
          code: "metafile-field-conflict",
          message: `${posix.dirname(found.file)} sets ${field} in both ${found.file} and ${file}; keeping the value of ${found.file}`,
          path: posix.dirname(file),
          files: freeze([found.file, file]),
        }),
      );
    }
  }

  return found;
}
