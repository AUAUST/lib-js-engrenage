import { isArray } from "@auaust/toolkit/isArray";
import { isPlainObject } from "@auaust/toolkit/isPlainObject";
import { isString } from "@auaust/toolkit/isString";
import { entries } from "@auaust/toolkit/object";

import { validate } from "#foundation/options/index";
import { formatContent } from "#project/format/index";
import { fetchIssue, isSameIssue } from "#tools/github/issues/contract/index";
import { readDraft } from "#tools/github/issues/drafts/operations/readDraft";
import { createManifestSchema } from "#tools/github/issues/drafts/utils/createManifestSchema";
import { findPublishedLocation } from "#tools/github/issues/drafts/utils/findPublishedLocation";
import { listDraftReferences } from "#tools/github/issues/drafts/utils/listDraftReferences";
import { locateDraft } from "#tools/github/issues/drafts/utils/locateDraft";
import { locateFetchedIssue } from "#tools/github/issues/drafts/utils/locateFetchedIssue";
import { mergeDraftBody } from "#tools/github/issues/drafts/utils/mergeDraftBody";
import { mergeDraftManifest } from "#tools/github/issues/drafts/utils/mergeDraftManifest";
import { parseStem } from "#tools/github/issues/drafts/utils/parseStem";
import { readIssueManifest } from "#tools/github/issues/drafts/utils/readIssueManifest";
import { resolveStem } from "#tools/github/issues/drafts/utils/resolveStem";
import { toDraftBody } from "#tools/github/issues/drafts/utils/toDraftBody";
import type { Publication } from "#tools/github/issues/drafts/types/Publication";
import type { PublishedDraft } from "#tools/github/issues/drafts/types/PublishedDraft";

type Manifest = Readonly<Record<string, unknown>>;

function toManifest(value: unknown): Manifest {
  return isPlainObject(value) ? value : {};
}

function listClaimedReferences(value: unknown) {
  return (isArray(value) ? value : []).map((entry: unknown) => {
    if (isString(entry)) {
      return entry;
    }

    return isPlainObject(entry) && isString(entry.ref) ? entry.ref : "";
  });
}

async function createBodyNormalizer(
  { config }: Publication,
  draft: PublishedDraft,
) {
  const selected = await config.resolve("format.formatter");

  const formatter = selected === false ? undefined : await selected.load();

  const path = locateDraft(draft.stem);

  return async (body: string) => {
    if (formatter === undefined) {
      return body;
    }

    const formatted = await formatContent(body, {
      path,
      config,
      formatter,
    });

    return formatted.trim();
  };
}

function checkSegment(
  { drafts, context }: Publication,
  draft: PublishedDraft,
  base: Manifest,
) {
  const changes = (
    draft.meaning === "segment" &&
    draft.manifest.subIssues !== undefined &&
    listDraftReferences(draft.manifest.subIssues).join(",") !==
      listClaimedReferences(base.subIssues).join(",")
  );

  const parent = draft.remote?.parent;

  const outside = (
    parent === undefined ||
    !drafts.some(({ stem }) => {
      const parsed = parseStem(stem);

      return (
        parsed?.kind === "issue" &&
        isSameIssue(
          {
            repository: resolveStem(parsed, context).repository,
            number: parsed.number,
          },
          parent,
        )
      );
    })
  );

  return changes && outside
    ? [
        `${draft.stem}: changes the Segment's \`subIssues\` while its parent Plan is outside the set: publish them together`,
      ]
    : [];
}

export async function fetchPublishedDraft(
  publication: Publication,
  draft: PublishedDraft,
): Promise<readonly string[]> {
  const { config, context, numbers } = publication;

  const { access, target } = draft;

  const { number } = findPublishedLocation(draft, context, numbers);

  const file = locateFetchedIssue(draft.stem);

  const fetched = await readDraft(config.context.filesystem, file);

  if (fetched === undefined) {
    return [
      `${draft.stem}: no fetched copy at ${file}: claim ${draft.stem} again`,
    ];
  }

  const remote = await fetchIssue(access, number);

  draft.remote = remote;

  const base = toManifest(fetched.manifest.toJS());

  const normalize = await createBodyNormalizer(publication, draft);

  // @debt The merge returns the formatted remote body, so publishing a draft whose body is unchanged can rewrite GitHub's body with formatter-only changes.

  const body = mergeDraftBody({
    base: await normalize(
      toDraftBody(fetched.body, access.repository, context, draft.contract),
    ),
    remote: await normalize(
      toDraftBody(remote.body, access.repository, context, draft.contract),
    ),
    local: await normalize(draft.draft.body),
  });

  const { manifest, conflicts } = mergeDraftManifest(
    {
      base,
      remote: readIssueManifest(remote, target, context),
      local: toManifest(draft.draft.manifest.toJS()),
    },
    context.protocol,
  );

  const lines = [...(body === undefined ? ["body"] : []), ...conflicts].map(
    (key) => {
      return `${draft.stem}: \`${key}\` changed both in the draft and on GitHub since the claim: merge ${draft.stem}'s change into the draft`;
    },
  );

  if (lines.length > 0) {
    return lines;
  }

  draft.body = body ?? draft.body;

  for (const [key, value] of entries(manifest)) {
    draft.draft.manifest.set(key, draft.draft.manifest.createNode(value));
  }

  draft.manifest = validate(
    createManifestSchema(context.snapshot, access.repository, draft.contract),
    manifest,
    `merged manifest of ${draft.stem}`,
  );

  return checkSegment(publication, draft, base);
}
