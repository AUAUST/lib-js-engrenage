import { array, object, optional, record, safeParse, string } from "valibot";
import { parse } from "yaml";

import {
  recordFileExtension,
  recordIndexName,
} from "#metalbrain/records/constants";
import { formatSchemaIssues } from "#metalbrain/records/utils/formatSchemaIssues";
import type { Filesystem } from "#foundation/filesystem/index";
import type { GroupedRecordKind } from "#metalbrain/records/types/GroupedRecordKind";
import type { File } from "#types/File";

const indexSchema = record(
  string(),
  object({
    purpose: optional(string()),
    entries: array(string()),
  }),
);

/**
 * The generated `index.yml` of `kind`, as `writeRecordIndex` writes it: each
 * group's name, `purpose` and entry IDs, in name order; empty when no group
 * file and no index exist.
 *
 * @throws {Error} When group files exist without the index, or the index is
 * unparsable or departs from its shape.
 */
export async function readRecordIndex(
  filesystem: Filesystem,
  kind: GroupedRecordKind,
) {
  const { directory } = kind.location;

  const file = `${directory}/${recordIndexName}${recordFileExtension}` satisfies File;

  const content = await filesystem.read(file);

  if (content === undefined) {
    const groups = await filesystem.glob(
      `${directory}/*${recordFileExtension}`,
    );

    if (groups.length > 0) {
      throw new Error(
        `${file} is missing: every ${kind.name} write and the project sync generate it`,
      );
    }

    return {};
  }

  let data: unknown;

  try {
    data = parse(content);
  } catch (error) {
    throw new Error(`${file}: invalid YAML: ${String(error)}`, {
      cause: error,
    });
  }

  const index = safeParse(indexSchema, data ?? {});

  if (!index.success) {
    throw new Error(
      [
        `The generated ${kind.name} index departs from its shape; every ${kind.name} write and the project sync regenerate it`,
        ...formatSchemaIssues(file, index.issues),
      ].join("\n"),
    );
  }

  return index.output;
}
