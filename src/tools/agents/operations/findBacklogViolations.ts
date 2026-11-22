import { findBacklogEntryViolations } from "#tools/agents/operations/findBacklogEntryViolations";
import { readBacklogCategories } from "#tools/agents/operations/readBacklogCategories";
import { formatSchemaIssues } from "#tools/agents/utils/formatSchemaIssues";
import type { Filesystem } from "#foundation/filesystem/index";

/**
 * Each departure of `.ai/backlog/*.yml` from the backlog file schema: an
 * unparsable file, a category key or value of the wrong form, an ID another entry
 * holds, and each departure `findBacklogEntryViolations` finds in an entry.
 */
export async function findBacklogViolations(
  filesystem: Filesystem,
  budget: number,
): Promise<string[]> {
  const violations: string[] = [];

  const owners = new Map<string, string>();

  for (const category of await readBacklogCategories(filesystem)) {
    const { file } = category;

    if (category.kind === "invalid") {
      violations.push(`${file}: invalid YAML: ${String(category.error)}`);

      continue;
    }

    if (category.issues.length > 0) {
      violations.push(...formatSchemaIssues(file, category.issues));

      continue;
    }

    for (const [index, entry] of category.entries.entries()) {
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
        ...(await findBacklogEntryViolations(
          filesystem,
          subject,
          entry,
          budget,
        )),
      );
    }
  }

  return violations;
}
