import { splitRepository } from "#tools/github/issues/api/index";
import {
  closeReasonParameters,
  issueTypeMutation,
} from "#tools/github/issues/drafts/constants";
import { writeFieldValue } from "#tools/github/issues/drafts/operations/writeFieldValue";
import { findPublishedLocation } from "#tools/github/issues/drafts/utils/findPublishedLocation";
import { findTypeNodeId } from "#tools/github/issues/drafts/utils/findTypeNodeId";
import { listPublishedFieldValues } from "#tools/github/issues/drafts/utils/listPublishedFieldValues";
import type { Publication } from "#tools/github/issues/drafts/types/Publication";
import type { PublishedDraft } from "#tools/github/issues/drafts/types/PublishedDraft";

export async function updatePublishedIssue(
  publication: Publication,
  draft: PublishedDraft,
  body: string,
): Promise<void> {
  const { manifest, remote, access, target } = draft;

  const {
    number,
  } = findPublishedLocation(draft, publication.context, publication.numbers);

  const { state } = manifest;

  await access.client.request(
    "PATCH /repos/{owner}/{repo}/issues/{issue_number}",
    {
      ...splitRepository(access.repository),
      issue_number: number,
      title: manifest.title,
      body,
      ...(manifest.labels === undefined
        ? {}
        : { labels: [...manifest.labels] }),
      ...(state === undefined
        ? {}
        : state === "open"
          ? { state: "open" as const }
          : {
              state: "closed" as const,
              state_reason: closeReasonParameters[state],
            }),
    },
  );

  if (remote?.type !== manifest.type) {
    await access.client.graphql(issueTypeMutation, {
      issueId: remote?.nodeId,
      issueTypeId: findTypeNodeId(target, manifest.type),
    });
  }

  const drafting = (
    access.repository === publication.context.repository ||
    remote?.blockers.includes(publication.context.protocol.options.drafting) ===
      true
  );

  for (const { field, value } of listPublishedFieldValues(
    publication,
    draft,
    drafting,
  )) {
    await writeFieldValue(
      access,
      number,
      field,
      remote?.fields[field.name],
      value,
    );
  }
}
