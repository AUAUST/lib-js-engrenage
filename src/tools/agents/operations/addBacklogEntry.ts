import { isSeq, parseDocument } from "yaml";

import {
  backlogCategoryExtension,
  backlogDetailKeys,
  backlogDirectory,
} from "#tools/agents/constants";
import { createBacklogId } from "#tools/agents/operations/createBacklogId";
import { findBacklogEntryViolations } from "#tools/agents/operations/findBacklogEntryViolations";
import { listBacklogIds } from "#tools/agents/operations/listBacklogIds";
import { formatSchemaIssues } from "#tools/agents/utils/formatSchemaIssues";
import { parseBacklogCategory } from "#tools/agents/utils/parseBacklogCategory";
import { throwViolations } from "#tools/agents/utils/throwViolations";
import type { Filesystem } from "#foundation/filesystem/index";
import type { File } from "#types/File";

function toDetail(items: readonly string[] | undefined) {
  if (items === undefined || items.length === 0) {
    return;
  }

  return items.length === 1 ? items[0] : items;
}

/**
 * Stages a new entry at the end of `.ai/backlog/<category>.yml`, leaving its
 * other entries as they are: an ID of `day` no entry holds, `title`, then `sites`
 * and each detail, a single item written as text.
 *
 * @returns The new entry's ID.
 * @throws {Error} When the category is missing or unparsable, or the entry or
 * its category would break the backlog file schema.
 */
export async function addBacklogEntry(
  filesystem: Filesystem,
  category: string,
  fields: {
    title: string;
    sites?: readonly string[] | undefined;
    why?: readonly string[] | undefined;
    want?: readonly string[] | undefined;
    done?: readonly string[] | undefined;
  },
  { day, budget }: { day: Date; budget: number },
): Promise<string> {
  const file = `${backlogDirectory}/${category}${backlogCategoryExtension}` satisfies File;

  const content = await filesystem.read(file);

  if (content === undefined) {
    throw new Error(
      `No backlog category "${category}": create it first with \`pnpm metalbrain backlog create ${category} "<purpose>"\``,
    );
  }

  const document = parseDocument(content);

  const [error] = document.errors;

  if (error !== undefined) {
    throw new Error(`${file}: invalid YAML: ${error.message}`);
  }

  const entries = document.get("entries");

  if (!isSeq(entries)) {
    throw new Error(`${file}: expected an \`entries\` list`);
  }

  const id = createBacklogId(await listBacklogIds(filesystem), day);

  const values = [
    ["id", id],
    ["title", fields.title],
    ["sites", fields.sites?.length === 0 ? undefined : fields.sites],
    ...backlogDetailKeys.map((key) => {
      return [key, toDetail(fields[key])] as const;
    }),
  ] as const;

  if (entries.items.length === 0) {
    entries.flow = false;
  }

  entries.add(
    document.createNode(
      Object.fromEntries(values.filter(([, value]) => value !== undefined)),
    ),
  );

  const updated = document.toString({
    lineWidth: 0,
    flowCollectionPadding: false,
  });

  const parsed = parseBacklogCategory(updated);

  if (parsed.kind === "invalid") {
    throw new Error(`${file}: invalid YAML: ${String(parsed.error)}`);
  }

  const added = parsed.entries.find(({ loose }) => loose.id === id);

  if (added === undefined) {
    throw new Error(`${file}: the added entry ${id} did not read back`);
  }

  throwViolations(
    `The entry would break the backlog file schema, so nothing was written:`,
    [
      ...formatSchemaIssues(file, parsed.issues),
      ...(await findBacklogEntryViolations(
        filesystem,
        `${file}: entry ${id}`,
        added,
        budget,
      )),
    ],
  );

  await filesystem.write(file, updated);

  return id;
}
