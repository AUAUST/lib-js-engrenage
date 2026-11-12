import { splitRepository } from "#tools/github/issues/api/index";
import {
  fetchIssueParent,
  findAncestors,
  renderReference,
  type IssueLocation,
} from "#tools/github/issues/contract/index";
import { headerPlaceholder } from "#tools/github/issues/drafts/constants";
import { listDraftReferences } from "#tools/github/issues/drafts/utils/listDraftReferences";
import { parseStem } from "#tools/github/issues/drafts/utils/parseStem";
import { readDraftHeader } from "#tools/github/issues/drafts/utils/readDraftHeader";
import { resolveIssueLocation } from "#tools/github/issues/drafts/utils/resolveIssueLocation";
import { resolveIssueStem } from "#tools/github/issues/drafts/utils/resolveIssueStem";
import { toDraftReference } from "#tools/github/issues/drafts/utils/toDraftReference";
import { toLocalStem } from "#tools/github/issues/drafts/utils/toLocalStem";
import type { Publication } from "#tools/github/issues/drafts/types/Publication";
import type { PublishedDraft } from "#tools/github/issues/drafts/types/PublishedDraft";

async function listDescendants(
  publication: Publication,
  numbers: ReadonlySet<number>,
) {
  const { access } = publication;

  const found = new Set<number>();
  const pending = [...numbers];

  for (
    let number = pending.pop();
    number !== undefined;
    number = pending.pop()
  ) {
    if (found.has(number)) {
      continue;
    }

    found.add(number);

    const children = await access.client.paginate(
      "GET /repos/{owner}/{repo}/issues/{issue_number}/sub_issues",
      { ...splitRepository(access.repository), issue_number: number },
    );

    pending.push(...children.map((child) => child.number));
  }

  return [...found]
    .filter((number) => {
      return !publication.drafts.some(({ stem }) => stem === String(number));
    })
    .toSorted((left, right) => left - right);
}

async function findCurrentParent(
  publication: Publication,
  reference: string,
): Promise<IssueLocation | undefined> {
  const { drafts, context, access, numbers } = publication;

  const child = drafts.find(({ stem }) => {
    return toDraftReference(stem) === reference;
  });

  if (child !== undefined) {
    return child.remote?.parent;
  }

  const location = resolveIssueLocation(reference, context, numbers);

  const parent = await fetchIssueParent(
    { ...access, repository: location.repository },
    location.number,
  );

  return parent;
}

async function checkPlanParent(
  publication: Publication,
  draft: PublishedDraft,
  reference: string,
): Promise<readonly string[]> {
  const { drafts, context, access, lookup } = publication;

  const parent = await findCurrentParent(publication, reference);

  if (parent === undefined) {
    return [];
  }

  const stem = toLocalStem(parent, context);

  const { type } = await lookup.find(parent);

  return type !== access.protocol.types.plan ||
    drafts.some((candidate) => candidate.stem === stem)
    ? []
    : [
        `${draft.stem}: moves ${reference} out of the Plan ${renderReference(parent, access.repository)}, outside the set, whose Roadmap would go stale: claim it with \`engrenage planning issue claim ${stem}\` and publish them together`,
      ];
}

export async function resolvePublishedAncestors(
  publication: Publication,
): Promise<readonly string[]> {
  const { drafts, context } = publication;

  function normalize(reference: string) {
    return toDraftReference(resolveIssueStem(reference, context));
  }

  const byReference = new Map(
    drafts.map((draft) => {
      return [toDraftReference(draft.stem), draft] as const;
    }),
  );

  const parents = new Map<PublishedDraft, PublishedDraft>();

  for (const draft of drafts) {
    for (const reference of listDraftReferences(draft.manifest.subIssues)) {
      const child = byReference.get(normalize(reference));

      if (child !== undefined) {
        parents.set(child, draft);
      }
    }
  }

  const lines: string[] = [];
  const remoteChains = new Map<PublishedDraft, readonly string[]>();

  for (const draft of drafts) {
    if (draft.remote === undefined) {
      continue;
    }

    const { chain, findings } = await findAncestors(draft.access, draft.remote);

    lines.push(...findings.map(({ message }) => `${draft.stem}: ${message}`));

    remoteChains.set(
      draft,
      chain.map((ancestor) => toDraftReference(toLocalStem(ancestor, context))),
    );
  }

  const resolved = new Map<PublishedDraft, readonly string[]>();

  function above(parent: PublishedDraft): readonly string[] {
    return parent.meaning === "plan" ? [] : resolve(parent);
  }

  function resolve(draft: PublishedDraft): readonly string[] {
    const known = resolved.get(draft);

    if (known !== undefined) {
      return known;
    }

    const parent = parents.get(draft);

    const remote = remoteChains.get(draft) ?? [];

    const index = remote.findLastIndex((reference) => {
      return byReference.has(reference);
    });

    const ancestor = index === -1
      ? undefined
      : byReference.get(remote[index] ?? "");

    const chain = parent !== undefined
      ? [...above(parent), toDraftReference(parent.stem)]
      : ancestor === undefined
        ? remote
        : index === remote.length - 1
          ? []
          : [...above(ancestor), ...remote.slice(index)];

    resolved.set(draft, chain);

    return chain;
  }

  for (const draft of drafts) {
    draft.ancestors = resolve(draft);

    if (draft.contract?.hasHeader !== true) {
      continue;
    }

    const header = readDraftHeader(draft.body);

    if (draft.ancestors.length > 0 && header === undefined) {
      lines.push(
        `${draft.stem}: has the ancestors ${draft.ancestors.join(", ")} after publishing but no header line: write \`${headerPlaceholder}\` before the first section`,
      );
    }

    if (draft.ancestors.length === 0 && header !== undefined) {
      lines.push(
        `${draft.stem}: has a header line but no ancestors after publishing: remove it, or list the draft in a parent's \`subIssues\``,
      );
    }
  }

  for (const draft of drafts) {
    const allListed = new Set(
      listDraftReferences(draft.manifest.subIssues).map(normalize),
    );

    const allAttached = new Set(
      (draft.remote?.subIssues ?? []).map((child) => {
        return toDraftReference(toLocalStem(child, context));
      }),
    );

    for (const reference of allListed.difference(allAttached)) {
      lines.push(...(await checkPlanParent(publication, draft, reference)));
    }

    const listed = new Set(
      [...allListed].filter((reference) => !byReference.has(reference)),
    );

    const attached = new Set(
      [...allAttached].filter((reference) => !byReference.has(reference)),
    );

    const moved = (
      draft.meaning !== "plan" &&
      draft.remote !== undefined &&
      draft.ancestors.join() !== (remoteChains.get(draft) ?? []).join()
    );

    const changed = moved
      ? listed.union(attached)
      : listed.symmetricDifference(attached);

    if (changed.size === 0) {
      continue;
    }

    const outside = await listDescendants(
      publication,
      new Set(
        [...changed]
          .map((reference) => parseStem(reference.slice(1)))
          .filter((parsed) => parsed?.kind === "issue")
          // @debt only descendants in the current repository are listed, so a change moving issues of another repository outside the set goes unreported
          .filter(({ short }) => short === undefined)
          .map(({ number }) => number),
      ),
    );

    lines.push(
      `${draft.stem}: changes the ancestors of ${outside
        .map((number) => {
          return `#${number}`;
        })
        .join(
          ", ",
        )} outside the set: claim them with \`engrenage planning issue claim ${outside.join(",")}\` and publish them together`,
    );
  }

  return lines;
}
