import { nullish, number, object, string } from "valibot";
import { Document, visit } from "yaml";

import { isString } from "@auaust/toolkit/isString";

import { validate } from "#foundation/options/index";
import { splitRepository } from "#tools/github/issues/api/index";
import { replaceOutsideCode } from "#tools/github/issues/contract/index";
import { issueTypeMutation } from "#tools/github/issues/drafts/constants";
import { writeFieldValue } from "#tools/github/issues/drafts/operations/writeFieldValue";
import { findBlockersField } from "#tools/github/issues/drafts/utils/findBlockersField";
import { findTypeNodeId } from "#tools/github/issues/drafts/utils/findTypeNodeId";
import { locateDraft } from "#tools/github/issues/drafts/utils/locateDraft";
import { locateFetchedIssue } from "#tools/github/issues/drafts/utils/locateFetchedIssue";
import { parseReference } from "#tools/github/issues/drafts/utils/parseReference";
import { readIssueManifest } from "#tools/github/issues/drafts/utils/readIssueManifest";
import { renderDraft } from "#tools/github/issues/drafts/utils/renderDraft";
import { resolveStem } from "#tools/github/issues/drafts/utils/resolveStem";
import { toDraftReference } from "#tools/github/issues/drafts/utils/toDraftReference";
import { toLocalStem } from "#tools/github/issues/drafts/utils/toLocalStem";
import type { DraftsContext } from "#tools/github/issues/drafts/types/DraftsContext";
import type { Publication } from "#tools/github/issues/drafts/types/Publication";
import type { PublishedDraft } from "#tools/github/issues/drafts/types/PublishedDraft";

const createdSchema = object({
  id: number(),
  node_id: string(),
  number: number(),
  title: string(),
  body: nullish(string()),
});

function rewriteReference(
  draft: PublishedDraft,
  context: DraftsContext,
  stem: string,
  to: string,
) {
  function names(reference: string) {
    const parsed = parseReference(reference);

    return (
      parsed?.kind === "draft" && resolveStem(parsed, context).stem === stem
    );
  }

  visit(draft.draft.manifest, {
    Scalar(_, node) {
      if (isString(node.value) && names(node.value)) {
        node.value = to;
      }
    },
  });

  draft.body = replaceOutsideCode(draft.body, /#\{[^{}\s]+\}/g, (match) => {
    return names(match) ? to : match;
  });
}

export async function createPublishedIssue(
  publication: Publication,
  draft: PublishedDraft,
): Promise<void> {
  const { config, context, lookup, drafts, numbers } = publication;

  const { filesystem } = config.context;

  const { access, target } = draft;

  const drafting = context.protocol.options.drafting;

  const created = await access.client.request(
    "POST /repos/{owner}/{repo}/issues",
    { ...splitRepository(access.repository), title: draft.manifest.title },
  );

  const data = validate(createdSchema, created.data, `issue ${draft.stem}`);

  await access.client.graphql(issueTypeMutation, {
    issueId: data.node_id,
    issueTypeId: findTypeNodeId(target, draft.manifest.type),
  });

  const blockers = findBlockersField(target, context.protocol);

  await writeFieldValue(access, data.number, blockers, [], [drafting]);

  const body = data.body ?? "";

  const location = { repository: access.repository, number: data.number };

  const stem = toLocalStem(location, context);

  numbers.set(draft.stem, location);

  lookup.remember(location, { id: data.id, type: draft.manifest.type });

  for (const other of drafts) {
    rewriteReference(other, context, draft.stem, toDraftReference(stem));
  }

  await filesystem.remove(locateDraft(draft.stem));

  draft.stem = stem;

  draft.remote = {
    id: data.id,
    nodeId: data.node_id,
    number: data.number,
    title: data.title,
    body,
    state: "open",
    stateReason: undefined,
    type: draft.manifest.type,
    labels: [],
    fields: { [blockers.name]: [drafting] },
    blockers: [drafting],
    subIssues: [],
    parent: undefined,
    blockedBy: [],
  };

  await filesystem.write(
    locateFetchedIssue(stem),
    renderDraft(
      new Document(readIssueManifest(draft.remote, target, context)),
      body,
    ),
  );

  for (const other of drafts) {
    await filesystem.write(
      locateDraft(other.stem),
      renderDraft(other.draft.manifest, other.body),
    );
  }

  await filesystem.flush();
}
