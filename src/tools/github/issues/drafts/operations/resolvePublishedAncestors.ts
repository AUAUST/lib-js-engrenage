import {
  readApiRepository,
  splitRepository,
} from "#tools/github/issues/api/index";
import {
  fetchIssueParent,
  findAncestors,
  renderReference,
  type IssueLocation,
} from "#tools/github/issues/contract/index";
import { headerPlaceholder } from "#tools/github/issues/drafts/constants";
import { listDraftReferences } from "#tools/github/issues/drafts/utils/listDraftReferences";
import { parseReference } from "#tools/github/issues/drafts/utils/parseReference";
import { readDraftHeader } from "#tools/github/issues/drafts/utils/readDraftHeader";
import { resolveIssueLocation } from "#tools/github/issues/drafts/utils/resolveIssueLocation";
import { resolveIssueStem } from "#tools/github/issues/drafts/utils/resolveIssueStem";
import { resolveStem } from "#tools/github/issues/drafts/utils/resolveStem";
import { toDraftReference } from "#tools/github/issues/drafts/utils/toDraftReference";
import { toLocalStem } from "#tools/github/issues/drafts/utils/toLocalStem";
import type { Publication } from "#tools/github/issues/drafts/types/Publication";
import type { PublishedDraft } from "#tools/github/issues/drafts/types/PublishedDraft";

async function listDescendants(
  publication: Publication,
  references: Iterable<string>,
) {
  const { access, context, drafts } = publication;

  const found = new Map<string, IssueLocation>();

  const pending = [...references].flatMap((reference): IssueLocation[] => {
    const parsed = parseReference(reference);

    return parsed?.kind === "issue"
      ? [
          {
            repository: resolveStem(parsed, context).repository,
            number: parsed.number,
          },
        ]
      : [];
  });

  for (
    let location = pending.pop();
    location !== undefined;
    location = pending.pop()
  ) {
    const stem = toLocalStem(location, context.repository, context);

    if (found.has(stem)) {
      continue;
    }

    found.set(stem, location);

    const children = await access.client.paginate(
      "GET /repos/{owner}/{repo}/issues/{issue_number}/sub_issues",
      {
        ...splitRepository(location.repository),
        issue_number: location.number,
      },
    );

    pending.push(
      ...children.map((child) => {
        return {
          repository: readApiRepository(child.repository_url),
          number: child.number,
        };
      }),
    );
  }

  return [...found]
    .filter(([stem]) => {
      return !drafts.some((draft) => draft.stem === stem);
    })
    .toSorted(([, left], [, right]) => {
      return (
        left.repository.localeCompare(right.repository) ||
        left.number - right.number
      );
    })
    .map(([stem]) => stem);
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

  const stem = toLocalStem(parent, context.repository, context);

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
      chain.map((ancestor) => {
        return toDraftReference(
          toLocalStem(ancestor, context.repository, context),
        );
      }),
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
        return toDraftReference(
          toLocalStem(child, context.repository, context),
        );
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

    const outside = await listDescendants(publication, changed);

    lines.push(
      `${draft.stem}: changes the ancestors of ${outside
        .map((stem) => {
          return /^\d+$/.test(stem) ? `#${stem}` : stem;
        })
        .join(
          ", ",
        )} outside the set: claim them with \`engrenage planning issue claim ${outside.join(",")}\` and publish them together`,
    );
  }

  return lines;
}
