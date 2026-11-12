import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { Document } from "yaml";

import { isArray } from "@auaust/toolkit/isArray";

import { spawnProcess } from "#foundation/processes/index";
import { renderReference } from "#tools/github/issues/contract/index";
import { writeFieldValue } from "#tools/github/issues/drafts/operations/writeFieldValue";
import { findPublishedLocation } from "#tools/github/issues/drafts/utils/findPublishedLocation";
import { listPublishedFieldValues } from "#tools/github/issues/drafts/utils/listPublishedFieldValues";
import { locateDraft } from "#tools/github/issues/drafts/utils/locateDraft";
import { locateFetchedIssue } from "#tools/github/issues/drafts/utils/locateFetchedIssue";
import { renderDraft } from "#tools/github/issues/drafts/utils/renderDraft";
import type { Publication } from "#tools/github/issues/drafts/types/Publication";
import type { PublishedDraft } from "#tools/github/issues/drafts/types/PublishedDraft";
import type { Directory } from "#types/Directory";

interface PublishedIssueReport {
  readonly diff: readonly string[];
  readonly summary: string;
}

async function diffPublished(root: Directory, stem: string, body: string) {
  const directory = await mkdtemp(join(tmpdir(), "engrenage-publish-"));

  const published = join(directory, `${stem}.md`);

  try {
    await writeFile(published, body);

    const { status, stdout, stderr, error } = await spawnProcess(
      "git",
      ["diff", "--no-index", "--no-color", locateFetchedIssue(stem), published],
      { cwd: root },
    );

    if (error !== undefined || (status !== 0 && status !== 1)) {
      throw new Error(`git diff of ${stem} failed: ${stderr.trim()}`, {
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
): Promise<PublishedIssueReport> {
  const { config, context, numbers } = publication;

  const { filesystem, root } = config.context;

  const location = findPublishedLocation(draft, context, numbers);

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
        draft.access,
        location.number,
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
    draft.stem,
    renderDraft(new Document(draft.draft.manifest.toJS()), body),
  );

  await filesystem.remove(locateDraft(draft.stem));

  await filesystem.remove(locateFetchedIssue(draft.stem));

  await filesystem.flush();

  return {
    diff: diff === "" ? [] : diff.split("\n"),
    summary: `${draft.origin}: published as ${renderReference(location, context.repository)}`,
  };
}
