import { stringify } from "yaml";

import { capitalize } from "@auaust/toolkit/string";

import {
  recordFileExtension,
  recordIndexName,
} from "#metalbrain/records/constants";
import { writeRecordIndex } from "#metalbrain/records/operations/writeRecordIndex";
import { formatSchemaIssues } from "#metalbrain/records/utils/formatSchemaIssues";
import { parseRecordGroup } from "#metalbrain/records/utils/parseRecordGroup";
import { throwViolations } from "#metalbrain/records/utils/throwViolations";
import type { Filesystem } from "#foundation/filesystem/index";
import type { RecordKind } from "#metalbrain/records/types/RecordKind";
import type { File } from "#types/File";

const groupNamePattern = /^[a-z\d]+(?:-[a-z\d]+)*$/u;

/**
 * Stages the `kind` group file `<name>.yml` with `purpose` and no entries, then
 * regenerates the kind's index.
 *
 * @throws {Error} When `name` is no lowercase dash-separated name, names the
 * index, or a file already holds it, or `purpose` breaks the kind's schema.
 */
export async function createRecordGroup(
  filesystem: Filesystem,
  kind: RecordKind,
  name: string,
  purpose: string,
): Promise<File> {
  const subject = `${capitalize(kind.name)} category "${name}"`;

  if (!groupNamePattern.test(name)) {
    throw new Error(
      `${subject}: expected lowercase words joined by dashes, naming the dependency family or subsystem it owns`,
    );
  }

  if (name === recordIndexName) {
    throw new Error(`${subject} names the generated ${kind.name} index`);
  }

  const file = `${kind.location.directory}/${name}${recordFileExtension}` satisfies File;

  if (await filesystem.exists(file)) {
    throw new Error(`${subject} already exists: ${file}`);
  }

  const content = stringify({ purpose, entries: [] }, { lineWidth: 0 });

  const group = parseRecordGroup(kind, content);

  if (group.kind === "invalid") {
    throw new Error(`${file}: invalid YAML: ${String(group.error)}`);
  }

  throwViolations(
    `${subject} departs from the ${kind.name} file schema:`,
    formatSchemaIssues(file, group.issues),
  );

  await filesystem.write(file, content);

  await writeRecordIndex(filesystem, kind);

  return file;
}
