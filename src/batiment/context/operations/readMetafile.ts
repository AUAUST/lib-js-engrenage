import { posix } from "node:path";

import type { GenericSchema, InferOutput } from "valibot";

import { freeze } from "@auaust/toolkit/object";

import { parseJson } from "#foundation/json/index";
import { validate } from "#foundation/options/index";
import type {
  StructureDiagnostic,
  StructureDiagnosticCode,
} from "#batiment/report/index";
import type { Filesystem } from "#foundation/filesystem/index";
import type { File } from "#types/File";

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

/**
 * Reads the metafile `file` against `schema`, or the diagnostic ignoring it when
 * it cannot be read, parsed or validated.
 */
export async function readMetafile<Schema extends GenericSchema>(
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
