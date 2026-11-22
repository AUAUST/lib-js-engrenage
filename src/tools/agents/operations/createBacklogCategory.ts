import { stringify } from "yaml";

import {
  backlogCategoryExtension,
  backlogDirectory,
  backlogIndex,
  legacyBacklogExtension,
} from "#tools/agents/constants";
import { renderBacklogIndex } from "#tools/agents/operations/renderBacklogIndex";
import { formatSchemaIssues } from "#tools/agents/utils/formatSchemaIssues";
import { parseBacklogCategory } from "#tools/agents/utils/parseBacklogCategory";
import { throwViolations } from "#tools/agents/utils/throwViolations";
import type { Filesystem } from "#foundation/filesystem/index";
import type { File } from "#types/File";

const categoryNamePattern = /^[a-z\d]+(?:-[a-z\d]+)*$/u;

/**
 * Stages `.ai/backlog/<name>.yml` with `purpose` and no entries, then renders
 * the index's category list again.
 *
 * @throws {Error} When `name` is no lowercase dash-separated name, a `.yml` or
 * legacy `.md` file already holds it, or `purpose` breaks the backlog file schema.
 */
export async function createBacklogCategory(
  filesystem: Filesystem,
  name: string,
  purpose: string,
): Promise<File> {
  if (!categoryNamePattern.test(name)) {
    throw new Error(
      `Backlog category "${name}": expected lowercase words joined by dashes, naming the dependency family or subsystem it owns`,
    );
  }

  const file = `${backlogDirectory}/${name}${backlogCategoryExtension}` satisfies File;
  const legacy = `${backlogDirectory}/${name}${legacyBacklogExtension}` satisfies File;

  if (legacy === backlogIndex) {
    throw new Error(`Backlog category "${name}" names the backlog index`);
  }

  for (const existing of [file, legacy]) {
    if (await filesystem.exists(existing)) {
      throw new Error(`Backlog category "${name}" already exists: ${existing}`);
    }
  }

  const content = stringify({ purpose, entries: [] }, { lineWidth: 0 });

  const category = parseBacklogCategory(content);

  if (category.kind === "invalid") {
    throw new Error(`${file}: invalid YAML: ${String(category.error)}`);
  }

  throwViolations(
    `Backlog category "${name}" departs from the backlog file schema:`,
    formatSchemaIssues(file, category.issues),
  );

  await filesystem.write(file, content);

  await renderBacklogIndex(filesystem);

  return file;
}
