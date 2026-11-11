import { isString } from "@auaust/toolkit/isString";

import { splitRepository } from "#tools/github/issues/api/index";
import { roadmapSection } from "#tools/github/issues/contract/constants";
import { parseIssueBody } from "#tools/github/issues/contract/index";
import { findPublishedNumber } from "#tools/github/issues/drafts/utils/findPublishedNumber";
import { insertSection } from "#tools/github/issues/drafts/utils/insertSection";
import { listDraftReferences } from "#tools/github/issues/drafts/utils/listDraftReferences";
import { readDraftHeader } from "#tools/github/issues/drafts/utils/readDraftHeader";
import { renderHeader } from "#tools/github/issues/drafts/utils/renderHeader";
import { renderRoadmap } from "#tools/github/issues/drafts/utils/renderRoadmap";
import { resolveDraftNumber } from "#tools/github/issues/drafts/utils/resolveDraftNumber";
import { splitBodySections } from "#tools/github/issues/drafts/utils/splitBodySections";
import type { Publication } from "#tools/github/issues/drafts/types/Publication";
import type { PublishedDraft } from "#tools/github/issues/drafts/types/PublishedDraft";
import type { RoadmapEntry } from "#tools/github/issues/drafts/types/RoadmapEntry";

async function listMembers(
  { context, access, lookup, drafts, numbers }: Publication,
  number: number,
) {
  const local = drafts.find((draft) => {
    return findPublishedNumber(draft, numbers) === number;
  });

  if (local !== undefined) {
    return local.meaning === "segment"
      ? listDraftReferences(local.manifest.subIssues).map((reference) => {
          return `#${resolveDraftNumber(reference, numbers)}`;
        })
      : [];
  }

  const { type } = await lookup.find(number);

  if (type !== context.protocol.types.segment) {
    return [];
  }

  const children = await access.client.paginate(
    "GET /repos/{owner}/{repo}/issues/{issue_number}/sub_issues",
    { ...splitRepository(access.repository), issue_number: number },
  );

  return children.map((child) => `#${child.number}`);
}

function renderBodyHeader(
  { body, contract, ancestors }: PublishedDraft,
  numbers: ReadonlyMap<string, number>,
) {
  const header = readDraftHeader(body);

  if (
    contract?.hasHeader !== true ||
    header === undefined ||
    ancestors.length === 0
  ) {
    return body;
  }

  const [, ...sections] = splitBodySections(body);

  return [
    renderHeader(
      ancestors.map((reference) => resolveDraftNumber(reference, numbers)),
      header,
    ),
    "",
    ...sections.flatMap(({ lines }) => lines),
  ]
    .join("\n")
    .trimEnd();
}

export async function renderPublishedBody(
  publication: Publication,
  draft: PublishedDraft,
): Promise<string> {
  const { contract, manifest } = draft;

  const body = renderBodyHeader(draft, publication.numbers);

  if (contract?.subIssues !== "roadmap" || manifest.subIssues === undefined) {
    return body;
  }

  const entries = manifest.subIssues
    .filter((entry): entry is RoadmapEntry => !isString(entry))
    .map((entry) => {
      return {
        ...entry,
        ref: `#${resolveDraftNumber(entry.ref, publication.numbers)}`,
      };
    });

  const members = new Map(
    await Promise.all(
      entries.map(async ({ ref }) => {
        return [
          ref,
          await listMembers(publication, Number(ref.slice(1))),
        ] as const;
      }),
    ),
  );

  const headings = parseIssueBody(body).sections.map(({ name }) => name);

  return insertSection(
    body,
    roadmapSection,
    renderRoadmap(entries, headings, members),
    contract.sections,
  );
}
