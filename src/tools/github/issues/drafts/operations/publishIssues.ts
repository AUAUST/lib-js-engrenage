import { parse } from "valibot";

import { isString } from "@auaust/toolkit/isString";

import { createGithubClient } from "#tools/github/issues/api/index";
import { issueContracts } from "#tools/github/issues/contract/constants";
import {
  findContractMeaning,
  type IssueAccess,
  type IssueContract,
} from "#tools/github/issues/contract/index";
import { createIssueLookup } from "#tools/github/issues/drafts/operations/createIssueLookup";
import { createPublishedIssue } from "#tools/github/issues/drafts/operations/createPublishedIssue";
import { detachSubIssues } from "#tools/github/issues/drafts/operations/detachSubIssues";
import { fetchPublishedDraft } from "#tools/github/issues/drafts/operations/fetchPublishedDraft";
import { finishPublishedIssue } from "#tools/github/issues/drafts/operations/finishPublishedIssue";
import { linkPublishedIssue } from "#tools/github/issues/drafts/operations/linkPublishedIssue";
import { readDraft } from "#tools/github/issues/drafts/operations/readDraft";
import { renderPublishedBody } from "#tools/github/issues/drafts/operations/renderPublishedBody";
import { resolveDraftsContext } from "#tools/github/issues/drafts/operations/resolveDraftsContext";
import { updatePublishedIssue } from "#tools/github/issues/drafts/operations/updatePublishedIssue";
import { checkDrafts } from "#tools/github/issues/drafts/utils/checkDrafts";
import { createManifestSchema } from "#tools/github/issues/drafts/utils/createManifestSchema";
import { isClaimedStem } from "#tools/github/issues/drafts/utils/isClaimedStem";
import { listDraftReferences } from "#tools/github/issues/drafts/utils/listDraftReferences";
import { locateDraft } from "#tools/github/issues/drafts/utils/locateDraft";
import { resolveManifestTarget } from "#tools/github/issues/drafts/utils/resolveManifestTarget";
import type { Filesystem } from "#foundation/filesystem/index";
import type { LoadedConfig } from "#project/config/index";
import type { Draft } from "#tools/github/issues/drafts/types/Draft";
import type { DraftsContext } from "#tools/github/issues/drafts/types/DraftsContext";
import type { IssuesCheck } from "#tools/github/issues/drafts/types/IssuesCheck";
import type { Publication } from "#tools/github/issues/drafts/types/Publication";
import type { PublishedDraft } from "#tools/github/issues/drafts/types/PublishedDraft";

function failed(lines: readonly string[]): IssuesCheck {
  return { lines, passed: false };
}

async function readDrafts(
  filesystem: Filesystem,
  stems: readonly string[],
): Promise<{ drafts: Map<string, Draft>; lines: string[] }> {
  const drafts = new Map<string, Draft>();
  const lines: string[] = [];

  for (const stem of stems) {
    const file = locateDraft(stem);

    const draft = await readDraft(filesystem, file);

    if (draft === undefined) {
      lines.push(`${stem}: no draft at ${file}`);
    } else {
      drafts.set(stem, draft);
    }
  }

  return { drafts, lines };
}

function toPublished(
  stem: string,
  draft: Draft,
  context: DraftsContext,
): PublishedDraft {
  const value: unknown = draft.manifest.toJS();

  const type = draft.manifest.get("type");

  const meaning = findContractMeaning(
    context.protocol,
    isString(type) ? type : undefined,
  );

  const contract:
    | IssueContract
    | undefined = meaning === undefined ? undefined : issueContracts[meaning];

  return {
    stem,
    draft,
    body: draft.body,
    remote: undefined,
    meaning,
    contract,
    manifest: parse(
      createManifestSchema(context.snapshot, context.repository, contract),
      value,
    ),
  };
}

function checkNewSegments(drafts: readonly PublishedDraft[]) {
  const listed = new Set(
    drafts
      .filter(({ meaning }) => meaning === "plan")
      .flatMap(({ manifest }) => listDraftReferences(manifest.subIssues)),
  );

  return drafts
    .filter(({ stem, meaning, manifest }) => {
      return (
        !isClaimedStem(stem) &&
        meaning === "segment" &&
        listDraftReferences(manifest.subIssues).length > 0 &&
        !listed.has(`#{${stem}}`)
      );
    })
    .map(({ stem }) => {
      return `${stem}: changes the Segment's \`subIssues\` while its parent Plan is outside the set: publish them together`;
    });
}

export async function publishIssues(
  config: LoadedConfig,
  stems: readonly string[],
): Promise<IssuesCheck> {
  const { filesystem } = config.context;

  const read = await readDrafts(filesystem, stems);

  if (read.lines.length > 0) {
    return failed(read.lines);
  }

  const context = await resolveDraftsContext(config);

  const findings = [...checkDrafts(read.drafts, context)].flatMap(
    ([stem, found]) => {
      return found.map(({ message }) => `${stem}: ${message}`);
    },
  );

  if (findings.length > 0) {
    return failed(findings);
  }

  const drafts = [...read.drafts].map(([stem, draft]) => {
    return toPublished(stem, draft, context);
  });

  const segments = checkNewSegments(drafts);

  if (segments.length > 0) {
    return failed(segments);
  }

  const access: IssueAccess = {
    repository: context.repository,
    client: await createGithubClient(),
    protocol: context.protocol,
  };

  const publication: Publication = {
    config,
    context,
    access,
    drafts,
    target: resolveManifestTarget(context.snapshot, context.repository),
    lookup: createIssueLookup(access),
    numbers: new Map(),
  };

  const conflicts: string[] = [];

  for (const draft of drafts.filter(({ stem }) => isClaimedStem(stem))) {
    conflicts.push(...(await fetchPublishedDraft(publication, draft)));

    if (!(draft.remote !== undefined)) {
      continue;
    }

    publication.lookup.remember(draft.remote.number, draft.remote);

    for (const related of [
      ...draft.remote.subIssues,
      ...draft.remote.blockedBy,
    ]) {
      publication.lookup.remember(related.number, { id: related.id });
    }
  }

  if (conflicts.length > 0) {
    return failed(conflicts);
  }

  for (const draft of drafts.filter(({ stem }) => !isClaimedStem(stem))) {
    await createPublishedIssue(publication, draft);
  }

  const bodies = new Map<PublishedDraft, string>();

  for (const draft of drafts) {
    const body = await renderPublishedBody(publication, draft);

    bodies.set(draft, body);

    await updatePublishedIssue(publication, draft, body);
  }

  for (const draft of drafts) {
    await detachSubIssues(publication, draft);
  }

  for (const draft of drafts) {
    await linkPublishedIssue(publication, draft);
  }

  const lines: string[] = [];

  for (const draft of drafts) {
    lines.push(
      ...(await finishPublishedIssue(
        publication,
        draft,
        bodies.get(draft) ?? draft.body,
      )),
    );
  }

  return { lines, passed: true };
}
