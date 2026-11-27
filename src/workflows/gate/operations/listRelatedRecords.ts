import { backlog } from "#metalbrain/backlog/constants";
import { formatRecordTree } from "#metalbrain/kinds/index";
import { findSimilarRecords } from "#metalbrain/records/index";
import { renderDenseEntry } from "#nexus/reports/index";
import { debtMarker } from "#tools/eslint/constants";
import { readStagedChanges, type CommitMessage } from "#tools/git/index";
import { commitSimilarityThreshold } from "#workflows/gate/constants";
import type { LoadedConfig } from "#project/config/index";

const typePrefix = /^[a-z]+:\s*/u;

const debtComment = new RegExp(
  String.raw`(?:\/\/|\/\*+|^\s*\*|#|<!--)\s*${debtMarker}\s+(\S.*?)\s*(?:\*\/|-->)?\s*$`,
  "u",
);

/**
 * The lines printing, as `formatRecordTree` makes their tree, the backlog
 * entries a commit may relate to, as `findSimilarRecords` finds them at
 * `commitSimilarityThreshold` from `message`'s subject and each debt marker
 * statement the staged changes add, or from the files they touch; none when
 * no entry relates.
 *
 * @throws {Error} When git fails, or as `findSimilarRecords` throws.
 */
export async function listRelatedRecords(
  config: LoadedConfig,
  { subject }: CommitMessage,
): Promise<string[]> {
  const { root, filesystem } = config.context;

  const { files, added } = await readStagedChanges(root);

  const statements = added.flatMap((line) => {
    return debtComment.exec(line)?.[1] ?? [];
  });

  const related = await findSimilarRecords(filesystem, [backlog], {
    texts: [subject.replace(typePrefix, ""), ...statements],
    files,
    threshold: commitSimilarityThreshold,
  });

  if (related.length === 0) {
    return [];
  }

  return [
    "Matching entries that might be related:",
    ...renderDenseEntry(
      formatRecordTree(
        related.map(({ record }) => {
          return record;
        }),
      ),
    ),
  ];
}
