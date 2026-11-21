import { resplitSection } from "#tools/github/issues/contract/constants";
import { listDraftReferences } from "#tools/github/issues/drafts/utils/listDraftReferences";
import { resolveIssueLocation } from "#tools/github/issues/drafts/utils/resolveIssueLocation";
import { resolveIssueStem } from "#tools/github/issues/drafts/utils/resolveIssueStem";
import { toDraftReference } from "#tools/github/issues/drafts/utils/toDraftReference";
import { toLocalStem } from "#tools/github/issues/drafts/utils/toLocalStem";
import type { IssueLocation } from "#tools/github/issues/contract/index";
import type { Publication } from "#tools/github/issues/drafts/types/Publication";
import type { PublishedDraft } from "#tools/github/issues/drafts/types/PublishedDraft";
import type { Resplit } from "#tools/github/issues/drafts/types/Resplit";

function createChangeFinder({ drafts, context }: Publication) {
  function normalize(reference: string) {
    return toDraftReference(resolveIssueStem(reference, context));
  }

  function toReference(location: IssueLocation) {
    return toDraftReference(toLocalStem(location, context.repository, context));
  }

  const listings = drafts
    .filter(({ manifest }) => manifest.subIssues !== undefined)
    .map((draft) => {
      return {
        reference: toDraftReference(draft.stem),
        children: listDraftReferences(draft.manifest.subIssues).map(normalize),
      };
    });

  function findParent(reference: string, remote: string) {
    const listing = listings.find(({ children }) => {
      return children.includes(reference);
    });

    if (listing !== undefined) {
      return listing.reference;
    }

    return listings.some((owner) => owner.reference === remote)
      ? undefined
      : remote;
  }

  // @debt a draft left as a claim by an interrupted first publish counts its first sub-issue links as a re-split, since nothing marks an issue whose first publish has not finished.
  function listChanges({ stem, remote, manifest }: PublishedDraft) {
    if (remote === undefined) {
      return [];
    }

    const attached = remote.subIssues.map(toReference);

    const listed = manifest.subIssues === undefined
      ? attached
      : listDraftReferences(manifest.subIssues).map(normalize);

    const parent = remote.parent === undefined
      ? undefined
      : toReference(remote.parent);

    const moved = (
      parent !== undefined &&
      findParent(toDraftReference(stem), parent) !== parent
    );

    return [
      ...(listed.join() === attached.join() ? [] : ["`subIssues`"]),
      ...(moved ? ["parent"] : []),
    ];
  }

  return { listChanges };
}

async function findPlan(
  { drafts, context, lookup, numbers }: Publication,
  draft: PublishedDraft,
): Promise<string | undefined> {
  if (draft.meaning === "plan") {
    return toDraftReference(draft.stem);
  }

  const [top] = draft.ancestors;

  if (top === undefined) {
    return;
  }

  const local = drafts.find(({ stem }) => toDraftReference(stem) === top);

  if (local !== undefined) {
    return local.meaning === "plan" ? top : undefined;
  }

  const {
    type,
  } = await lookup.find(resolveIssueLocation(top, context, numbers));

  return type === context.contractNames.types.plan ? top : undefined;
}

export async function resolveResplits(publication: Publication): Promise<{
  readonly resplits: readonly Resplit[];
  readonly lines: readonly string[];
}> {
  const { listChanges } = createChangeFinder(publication);

  const resplits: Resplit[] = [];
  const lines: string[] = [];

  for (const draft of publication.drafts) {
    const changes = listChanges(draft);

    const reason = draft.manifest.resplit;

    const plan = changes.length === 0
      ? undefined
      : await findPlan(publication, draft);

    if (plan !== undefined && reason !== undefined) {
      resplits.push({
        draft,
        plan,
        reason,
      });
    } else if (plan !== undefined) {
      lines.push(
        `${draft.stem}: changes the published issue's ${changes.join(" and ")} without a reason: set \`resplit:\` to why, which publish logs in the Plan's **${resplitSection}**`,
      );
    } else if (reason !== undefined && changes.length === 0) {
      lines.push(
        `${draft.stem}: sets \`resplit\` but changes neither the \`subIssues\` nor the parent of a published issue: remove it`,
      );
    } else if (reason !== undefined) {
      lines.push(
        `${draft.stem}: sets \`resplit\` but no Plan holds the issue to log the re-split: remove it`,
      );
    }
  }

  return { resplits, lines };
}
