import { findRecordEntryViolations } from "#metalbrain/records/operations/findRecordEntryViolations";
import { readRecordGroups } from "#metalbrain/records/operations/readRecordGroups";
import { formatSchemaIssues } from "#metalbrain/records/utils/formatSchemaIssues";
import type { Filesystem } from "#foundation/filesystem/index";
import type { RecordKind } from "#metalbrain/records/types/RecordKind";

/**
 * Each departure of the group files of `kind` from its schema: an unparsable
 * file, a group key or value of the wrong form, an ID another entry holds, and
 * each departure `findRecordEntryViolations` finds in an entry.
 */
export async function findRecordViolations(
  filesystem: Filesystem,
  kind: RecordKind,
  wordCap: number,
): Promise<string[]> {
  const violations: string[] = [];

  const owners = new Map<string, string>();

  for (const group of await readRecordGroups(filesystem, kind)) {
    const { file } = group;

    if (group.kind === "invalid") {
      violations.push(`${file}: invalid YAML: ${String(group.error)}`);

      continue;
    }

    if (group.issues.length > 0) {
      violations.push(...formatSchemaIssues(file, group.issues));

      continue;
    }

    for (const [index, entry] of group.entries.entries()) {
      const subject = `${file}: entry ${entry.loose.id ?? `#${index + 1}`}`;

      if (entry.valid) {
        const owner = owners.get(entry.entry.id);

        if (owner === undefined) {
          owners.set(entry.entry.id, file);
        } else {
          violations.push(
            `${subject}: ID already held by an entry of ${owner}`,
          );
        }
      }

      violations.push(
        ...(await findRecordEntryViolations(
          filesystem,
          kind,
          subject,
          entry,
          wordCap,
        )),
      );
    }
  }

  return violations;
}
