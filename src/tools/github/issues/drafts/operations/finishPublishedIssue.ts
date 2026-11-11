import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { Document } from "yaml";

import { isArray } from "@auaust/toolkit/isArray";

import { spawnProcess } from "#foundation/processes/index";
import { writeFieldValue } from "#tools/github/issues/drafts/operations/writeFieldValue";
import { findPublishedNumber } from "#tools/github/issues/drafts/utils/findPublishedNumber";
import { listPublishedFieldValues } from "#tools/github/issues/drafts/utils/listPublishedFieldValues";
import { locateDraft } from "#tools/github/issues/drafts/utils/locateDraft";
import { locateFetchedIssue } from "#tools/github/issues/drafts/utils/locateFetchedIssue";
import { renderDraft } from "#tools/github/issues/drafts/utils/renderDraft";
import type { Publication } from "#tools/github/issues/drafts/types/Publication";
import type { PublishedDraft } from "#tools/github/issues/drafts/types/PublishedDraft";
import type { Directory } from "#types/Directory";

async function diffPublished(root: Directory, number: number, body: string) {
  const directory = await mkdtemp(join(tmpdir(), "engrenage-publish-"));

  const published = join(directory, `${number}.md`);

  try {
    await writeFile(published, body);

    const { status, stdout, stderr, error } = await spawnProcess(
      "git",
      [
        "diff",
        "--no-index",
        "--no-color",
        locateFetchedIssue(number),
        published,
      ],
      { cwd: root },
    );

    if (error !== undefined || (status !== 0 && status !== 1)) {
      throw new Error(`git diff of #${number} failed: ${stderr.trim()}`, {
        cause: error,
      });
    }

    return stdout.trimEnd();
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
}

export async function finishPublishedIssue(
  publication: Publication,
  draft: PublishedDraft,
  body: string,
): Promise<readonly string[]> {
  const { config, access, numbers } = publication;

  const { filesystem, root } = config.context;

  const number = findPublishedNumber(draft, numbers);

  if (draft.manifest.claim !== "existing") {
    const [blockers] = listPublishedFieldValues(
      publication,
      draft,
      false,
    ).filter(({ field }) => {
      return field.name === publication.context.protocol.fields.blockers;
    });

    if (blockers !== undefined) {
      await writeFieldValue(
        access,
        number,
        blockers.field,
        [
          ...(isArray(blockers.value) ? blockers.value : []),
          publication.context.protocol.options.drafting,
        ],
        blockers.value,
      );
    }
  }

  const diff = await diffPublished(
    root,
    number,
    renderDraft(new Document(draft.draft.manifest.toJS()), body),
  );

  await filesystem.remove(locateDraft(draft.stem));

  await filesystem.remove(locateFetchedIssue(number));

  await filesystem.flush();

  return [`#${number}: published`, ...(diff === "" ? [] : diff.split("\n"))];
}
