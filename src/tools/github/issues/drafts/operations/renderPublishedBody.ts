import { isString } from "@auaust/toolkit/isString";

import {
  readApiRepository,
  splitRepository,
} from "#tools/github/issues/api/index";
import { roadmapSection } from "#tools/github/issues/contract/constants";
import {
  isSameIssue,
  parseIssueBody,
  renderReference,
  type IssueLocation,
} from "#tools/github/issues/contract/index";
import { findPublishedLocation } from "#tools/github/issues/drafts/utils/findPublishedLocation";
import { insertSection } from "#tools/github/issues/drafts/utils/insertSection";
import { listDraftReferences } from "#tools/github/issues/drafts/utils/listDraftReferences";
import { readDraftHeader } from "#tools/github/issues/drafts/utils/readDraftHeader";
import { renderDraftReferences } from "#tools/github/issues/drafts/utils/renderDraftReferences";
import { renderHeader } from "#tools/github/issues/drafts/utils/renderHeader";
import { renderRoadmap } from "#tools/github/issues/drafts/utils/renderRoadmap";
import { resolveIssueLocation } from "#tools/github/issues/drafts/utils/resolveIssueLocation";
import { splitBodySections } from "#tools/github/issues/drafts/utils/splitBodySections";
import type { Publication } from "#tools/github/issues/drafts/types/Publication";
import type { PublishedDraft } from "#tools/github/issues/drafts/types/PublishedDraft";
import type { RoadmapEntry } from "#tools/github/issues/drafts/types/RoadmapEntry";

async function listMembers(
  { context, access, lookup, drafts, numbers }: Publication,
  location: IssueLocation,
): Promise<readonly IssueLocation[]> {
  const local = drafts.find((draft) => {
    return isSameIssue(
      findPublishedLocation(draft, context, numbers),
      location,
    );
  });

  if (local !== undefined) {
    return local.meaning === "segment"
      ? listDraftReferences(local.manifest.subIssues).map((reference) => {
          return resolveIssueLocation(reference, context, numbers);
        })
      : [];
  }

  const { type } = await lookup.find(location);

  if (type !== context.protocol.types.segment) {
    return [];
  }

  const children = await access.client.paginate(
    "GET /repos/{owner}/{repo}/issues/{issue_number}/sub_issues",
    { ...splitRepository(location.repository), issue_number: location.number },
  );

  return children.map((child) => {
    return {
      repository: readApiRepository(child.repository_url),
      number: child.number,
    };
  });
}

function renderBodyHeader(
  { body, contract, ancestors, access }: PublishedDraft,
  { context, numbers }: Publication,
) {
  const rendered = renderDraftReferences(
    body,
    access.repository,
    context,
    numbers,
  );

  const header = readDraftHeader(rendered);

  if (
    contract?.hasHeader !== true ||
    header === undefined ||
    ancestors.length === 0
  ) {
    return rendered;
  }

  const [, ...sections] = splitBodySections(rendered);

  return [
    renderHeader(
      ancestors.map((reference) => {
        return renderReference(
          resolveIssueLocation(reference, context, numbers),
          access.repository,
        );
      }),
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
  const { contract, manifest, access } = draft;

  const { context, numbers } = publication;

  const body = renderBodyHeader(draft, publication);

  if (contract?.subIssues !== "roadmap" || manifest.subIssues === undefined) {
    return body;
  }

  const located = manifest.subIssues
    .filter((entry): entry is RoadmapEntry => !isString(entry))
    .map((entry) => {
      return {
        entry,
        location: resolveIssueLocation(entry.ref, context, numbers),
      };
    });

  const entries = located.map(({ entry, location }) => {
    return { ...entry, ref: renderReference(location, access.repository) };
  });

  const members = new Map(
    await Promise.all(
      located.map(async ({ location }) => {
        const children = await listMembers(publication, location);

        return [
          renderReference(location, access.repository),
          children.map((child) => {
            return renderReference(child, access.repository);
          }),
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
