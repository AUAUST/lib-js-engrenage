import { isArray } from "@auaust/toolkit/isArray";
import { isPlainObject } from "@auaust/toolkit/isPlainObject";
import { isString } from "@auaust/toolkit/isString";
import { entries } from "@auaust/toolkit/object";

import { validate } from "#foundation/options/index";
import { fetchIssue } from "#tools/github/issues/contract/index";
import { readDraft } from "#tools/github/issues/drafts/operations/readDraft";
import { createManifestSchema } from "#tools/github/issues/drafts/utils/createManifestSchema";
import { listDraftReferences } from "#tools/github/issues/drafts/utils/listDraftReferences";
import { locateFetchedIssue } from "#tools/github/issues/drafts/utils/locateFetchedIssue";
import { mergeDraftBody } from "#tools/github/issues/drafts/utils/mergeDraftBody";
import { mergeDraftManifest } from "#tools/github/issues/drafts/utils/mergeDraftManifest";
import { readIssueManifest } from "#tools/github/issues/drafts/utils/readIssueManifest";
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

function checkSegment(
  { drafts }: Publication,
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
    parent === undefined || !drafts.some(({ stem }) => stem === String(parent))
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
  const { config, context, access, target } = publication;

  const number = Number(draft.stem);

  const file = locateFetchedIssue(number);

  const fetched = await readDraft(config.context.filesystem, file);

  if (fetched === undefined) {
    return [
      `${draft.stem}: no fetched copy at ${file}: claim #${number} again`,
    ];
  }

  const remote = await fetchIssue(access, number);

  draft.remote = remote;

  const base = toManifest(fetched.manifest.toJS());

  const body = mergeDraftBody(
    {
      base: fetched.body,
      remote: remote.body,
      local: draft.draft.body,
    },
    context.repository,
    draft.contract,
  );

  const { manifest, conflicts } = mergeDraftManifest(
    {
      base,
      remote: readIssueManifest(remote, target, context.protocol),
      local: toManifest(draft.draft.manifest.toJS()),
    },
    context.protocol,
  );

  const lines = [...(body === undefined ? ["body"] : []), ...conflicts].map(
    (key) => {
      return `${draft.stem}: \`${key}\` changed both in the draft and on GitHub since the claim: merge #${number}'s change into the draft`;
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
    createManifestSchema(context.snapshot, context.repository, draft.contract),
    manifest,
    `merged manifest of ${draft.stem}`,
  );

  return checkSegment(publication, draft, base);
}
