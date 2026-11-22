import { posix } from "node:path";

import { isPlainObject, isString } from "@auaust/toolkit";

import {
  backlogCategoriesHeading,
  backlogIndex,
  backlogTemplate,
} from "#tools/agents/constants";
import { readBacklogCategories } from "#tools/agents/operations/readBacklogCategories";
import { formatBacklogIndex } from "#tools/agents/utils/formatBacklogIndex";
import { formatReferenceMarker } from "#tools/agents/utils/formatReferenceMarker";
import type { Filesystem } from "#foundation/filesystem/index";

async function listCategoryLines(filesystem: Filesystem): Promise<string[]> {
  const categories = await readBacklogCategories(filesystem);

  const lines = categories.map((category) => {
    const link = `- [${category.name}](${posix.basename(category.file)})`;

    const purpose = category.kind === "parsed" && isPlainObject(category.data)
      ? category.data.purpose
      : undefined;

    return isString(purpose) ? `${link}: ${purpose}` : link;
  });

  return [
    "",
    ...(lines.length === 0 ? ["No open categories yet."] : lines),
    "",
  ];
}

/**
 * Renders the backlog index's category list from each category's `purpose`, first
 * replacing inline instructions with the template block.
 *
 * @throws {Error} When the index has no categories heading.
 */
export async function renderBacklogIndex(
  filesystem: Filesystem,
): Promise<void> {
  const content = await filesystem.read(backlogIndex);

  if (content === undefined) {
    return;
  }

  const lines = content.split("\n");
  const heading = lines.indexOf(backlogCategoriesHeading);

  if (heading === -1) {
    throw new Error(
      `${backlogIndex} has no "${backlogCategoriesHeading}" heading: add it below the instructions so sync can own them`,
    );
  }

  const categories = await listCategoryLines(filesystem);

  await filesystem.write(
    backlogIndex,
    content.includes(formatReferenceMarker(backlogTemplate))
      ? [...lines.slice(0, heading + 1), ...categories].join("\n")
      : formatBacklogIndex(lines[0] ?? "", categories),
  );
}
