import { RequestError } from "@octokit/request-error";
import { parse } from "valibot";

import { isString } from "@auaust/toolkit";

import {
  createGithubClient,
  type GithubClient,
} from "#tools/github/issues/api/index";
import { issueContracts } from "#tools/github/issues/contract/constants";
import {
  checkNesting,
  findContractMeaning,
  isBlockingFinding,
  isSameIssue,
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
import { resolvePublishedAncestors } from "#tools/github/issues/drafts/operations/resolvePublishedAncestors";
import { resolveResplits } from "#tools/github/issues/drafts/operations/resolveResplits";
import { updatePublishedIssue } from "#tools/github/issues/drafts/operations/updatePublishedIssue";
import { writeResplitLogs } from "#tools/github/issues/drafts/operations/writeResplitLogs";
import { checkDrafts } from "#tools/github/issues/drafts/utils/checkDrafts";
import { createManifestSchema } from "#tools/github/issues/drafts/utils/createManifestSchema";
import { findPublishedLocation } from "#tools/github/issues/drafts/utils/findPublishedLocation";
import { isClaimedStem } from "#tools/github/issues/drafts/utils/isClaimedStem";
import { listDraftReferences } from "#tools/github/issues/drafts/utils/listDraftReferences";
import { listResplitLogs } from "#tools/github/issues/drafts/utils/listResplitLogs";
import { locateDraft } from "#tools/github/issues/drafts/utils/locateDraft";
import { parseReference } from "#tools/github/issues/drafts/utils/parseReference";
import { parseStem } from "#tools/github/issues/drafts/utils/parseStem";
import { resolveManifestTarget } from "#tools/github/issues/drafts/utils/resolveManifestTarget";
import { resolveStem } from "#tools/github/issues/drafts/utils/resolveStem";
import type { Filesystem } from "#foundation/filesystem/index";
import type { LoadedConfig } from "#project/config/index";
import type { Draft } from "#tools/github/issues/drafts/types/Draft";
import type { DraftsContext } from "#tools/github/issues/drafts/types/DraftsContext";
import type { IssuesCheck } from "#tools/github/issues/drafts/types/IssuesCheck";
import type { Publication } from "#tools/github/issues/drafts/types/Publication";
import type { PublishedDraft } from "#tools/github/issues/drafts/types/PublishedDraft";
import type { Resplit } from "#tools/github/issues/drafts/types/Resplit";

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
  client: GithubClient,
): PublishedDraft {
  const parsed = parseStem(stem);

  if (parsed === undefined) {
    throw new Error(`${stem} is not a draft stem`);
  }

  const { repository } = resolveStem(parsed, context);
  const value: unknown = draft.manifest.toJS();

  const type = draft.manifest.get("type");

  const meaning = findContractMeaning(
    context.contractNames,
    isString(type) ? type : undefined,
  );

  const contract:
    | IssueContract
    | undefined = meaning === undefined ? undefined : issueContracts[meaning];

  return {
    stem,
    origin: stem,
    draft,
    body: draft.body,
    remote: undefined,
    ancestors: [],
    meaning,
    contract,
    target: resolveManifestTarget(context.snapshot, repository),
    access: {
      repository,
      client,
      contractNames: context.contractNames,
    },
    manifest: parse(
      createManifestSchema(context.snapshot, repository, context.contractNames),
      value,
    ),
  };
}

function checkNewSegments(drafts: readonly PublishedDraft[]) {
  const listed = new Set(
    drafts
      .filter(({ meaning }) => meaning !== "segment")
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
      return `${stem}: changes the Segment's \`subIssues\` while the issue listing it is outside the set: publish them together`;
    });
}

async function checkNestedSegments({ drafts, context, lookup }: Publication) {
  const stems = new Set(drafts.map(({ stem }) => stem));

  const nested = await Promise.all(
    drafts
      .filter(({ meaning }) => meaning === "segment")
      .map(async ({ stem, manifest }) => {
        const types = await Promise.all(
          listDraftReferences(manifest.subIssues)
            .map((reference) => parseReference(reference))
            .filter((parsed) => parsed?.kind === "issue")
            .map((parsed) => {
              return { parsed, ...resolveStem(parsed, context) };
            })
            .filter(({ stem }) => !stems.has(stem))
            .map(async ({ repository, parsed }) => {
              const { type } = await lookup.find({
                repository,
                number: parsed.number,
              });

              return type;
            }),
        );

        return types.flatMap((type) => {
          return checkNesting(
            findContractMeaning(context.contractNames, type),
            "segment",
          ).map(({ message }) => `${stem}: ${message}`);
        });
      }),
  );

  return nested.flat();
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

  const findings = [
    ...checkDrafts(read.drafts, context, {
      complete: false,
    }),
  ].flatMap(([stem, found]) => {
    return found
      .filter(isBlockingFinding)
      .map(({ message }) => `${stem}: ${message}`);
  });

  if (findings.length > 0) {
    return failed(findings);
  }

  const client = await createGithubClient();

  const drafts = [...read.drafts].map(([stem, draft]) => {
    return toPublished(stem, draft, context, client);
  });

  const segments = checkNewSegments(drafts);

  if (segments.length > 0) {
    return failed(segments);
  }

  const publication: Publication = {
    config,
    context,
    client,
    drafts,
    lookup: createIssueLookup(client),
    numbers: new Map(),
  };

  const nested = await checkNestedSegments(publication);

  if (nested.length > 0) {
    return failed(nested);
  }

  const conflicts: string[] = [];

  for (const draft of drafts.filter(({ stem }) => isClaimedStem(stem))) {
    conflicts.push(...(await fetchPublishedDraft(publication, draft)));

    if (draft.remote === undefined) {
      continue;
    }

    publication.lookup.remember(
      {
        repository: draft.access.repository,
        number: draft.remote.number,
      },
      draft.remote,
    );

    for (const related of [
      ...draft.remote.subIssues,
      ...draft.remote.blockedBy,
    ]) {
      publication.lookup.remember(related, { id: related.id });
    }
  }

  if (conflicts.length > 0) {
    return failed(conflicts);
  }

  const chains = await resolvePublishedAncestors(publication);

  if (chains.length > 0) {
    return failed(chains);
  }

  const { resplits, lines } = await resolveResplits(publication);

  if (lines.length > 0) {
    return failed(lines);
  }

  try {
    return await writeDrafts(publication, resplits);
  } catch (error) {
    throw explainRefusal(error, context.repository);
  }
}

function explainRefusal(error: unknown, current: string | undefined) {
  if (!(error instanceof RequestError)) {
    return error;
  }

  const repository = /\/repos\/([\w.-]+\/[\w.-]+)\//.exec(
    new URL(error.request.url).pathname,
  )?.[1];

  if (repository === undefined) {
    return error;
  }

  if (
    (error.status === 403 || error.status === 404) &&
    repository.toLowerCase() !== current?.toLowerCase()
  ) {
    return new Error(
      `${repository} refused the write (${error.status}): publishing there needs \`repo\` on a classic or \`gh\` token, or Issues read and write on ${repository} for a fine-grained token`,
      { cause: error },
    );
  }

  if (
    error.status === 422 &&
    /\/(?:sub_issues|dependencies\/blocked_by)$/.test(error.request.url)
  ) {
    return new Error(
      `GitHub refused a link on an issue of ${repository} (422): a sub-issue must share its parent's owner, and GitHub does not document blocked-by across repositories; ${error.message}`,
      { cause: error },
    );
  }

  return error;
}

async function writeDrafts(
  publication: Publication,
  resplits: readonly Resplit[],
): Promise<IssuesCheck> {
  const { drafts, context, numbers } = publication;

  for (const draft of drafts.filter(({ stem }) => !isClaimedStem(stem))) {
    await createPublishedIssue(publication, draft);
  }

  const logs = listResplitLogs(
    resplits,
    context,
    numbers,
    new Date().toISOString().slice(0, 10),
  );

  const bodies = new Map<PublishedDraft, string>();

  for (const draft of drafts) {
    const location = findPublishedLocation(draft, context, numbers);

    const log = logs.find(({ plan }) => isSameIssue(plan, location));

    const body = await renderPublishedBody(
      publication,
      draft,
      log?.lines ?? [],
    );

    bodies.set(draft, body);

    await updatePublishedIssue(publication, draft, body);
  }

  for (const draft of drafts) {
    await detachSubIssues(publication, draft);
  }

  for (const draft of drafts) {
    await linkPublishedIssue(publication, draft);
  }

  await writeResplitLogs(publication, logs);

  const diffs: string[] = [];

  const summaries: string[] = [];

  for (const draft of drafts) {
    const { diff, summary } = await finishPublishedIssue(
      publication,
      draft,
      bodies.get(draft) ?? draft.body,
    );

    diffs.push(...diff);

    summaries.push(summary);
  }

  return { lines: [...diffs, ...summaries], passed: true };
}
