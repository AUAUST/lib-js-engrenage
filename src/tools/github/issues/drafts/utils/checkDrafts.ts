import { getDotPath, safeParse } from "valibot";

import { isArray, isPlainObject, isString } from "@auaust/toolkit";

import { stripCode } from "#foundation/markdown/index";
import { splitRepository } from "#tools/github/issues/api/index";
import { issueContracts } from "#tools/github/issues/contract/constants";
import {
  checkIssueSpec,
  checkNesting,
  findContractMeaning,
  parseIssueBody,
  type ContractMeaning,
  type ContractNames,
  type IssueAudience,
  type IssueFinding,
} from "#tools/github/issues/contract/index";
import { checkDraftBody } from "#tools/github/issues/drafts/utils/checkDraftBody";
import { checkDraftHeader } from "#tools/github/issues/drafts/utils/checkDraftHeader";
import { checkExternalSections } from "#tools/github/issues/drafts/utils/checkExternalSections";
import { createManifestSchema } from "#tools/github/issues/drafts/utils/createManifestSchema";
import { listDraftReferences } from "#tools/github/issues/drafts/utils/listDraftReferences";
import { parseReference } from "#tools/github/issues/drafts/utils/parseReference";
import { parseStem } from "#tools/github/issues/drafts/utils/parseStem";
import { resolveDraftRepository } from "#tools/github/issues/drafts/utils/resolveDraftRepository";
import { resolveStem } from "#tools/github/issues/drafts/utils/resolveStem";
import type { Draft } from "#tools/github/issues/drafts/types/Draft";
import type { DraftManifest } from "#tools/github/issues/drafts/types/DraftManifest";
import type { DraftsContext } from "#tools/github/issues/drafts/types/DraftsContext";

function listRelations({ subIssues = [], blockedBy = [] }: DraftManifest) {
  return [
    ...subIssues.map((entry) => {
      return isString(entry) ? entry : entry.ref;
    }),
    ...blockedBy,
  ];
}

function resolveReference(reference: string, context: DraftsContext) {
  const parsed = parseReference(reference);

  if (parsed === undefined) {
    return;
  }

  try {
    return { parsed, ...resolveStem(parsed, context) };
  } catch (error) {
    return {
      parsed,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

function findTarget(reference: string, context: DraftsContext) {
  const resolved = resolveReference(reference, context);

  return resolved === undefined || "error" in resolved
    ? undefined
    : resolved.stem;
}

function checkReference(
  reference: string,
  stems: ReadonlySet<string>,
  repository: string,
  context: DraftsContext,
): IssueFinding | undefined {
  const resolved = resolveReference(reference, context);

  if (resolved === undefined) {
    return {
      rule: "reference",
      message: `\`${reference}\` is not a reference: write \`#123\`, \`#{new-<slug>}\`, \`#{<repo>.123}\` or \`#{<repo>.new-<slug>}\`.`,
    };
  }

  if ("error" in resolved) {
    return {
      rule: "reference",
      message: `\`${reference}\`: ${resolved.error}.`,
    };
  }

  if (repository !== context.repository && /^#\d+$/.test(reference)) {
    return {
      rule: "bare-reference",
      message: `\`${reference}\` is bare in a draft of ${repository}: write \`#{<repo>.${reference.slice(1)}}\` with the registered name of the issue's repository, ${repository}'s included.`,
    };
  }

  if (resolved.parsed.kind === "draft" && !stems.has(resolved.stem)) {
    return {
      rule: "outside-draft",
      message: `\`${reference}\` names the draft \`${resolved.stem}\`, outside the drafts it can resolve against: create it, or publish it with them.`,
    };
  }
}

function checkOwners(
  manifest: DraftManifest,
  repository: string,
  context: DraftsContext,
): IssueFinding[] {
  const { owner } = splitRepository(repository);

  return listDraftReferences(manifest.subIssues)
    .map((reference) => {
      return {
        reference,
        resolved: resolveReference(reference, context),
      };
    })
    .filter(({ resolved }) => {
      return (
        resolved !== undefined &&
        !("error" in resolved) &&
        splitRepository(resolved.repository).owner !== owner
      );
    })
    .map(({ reference }) => {
      return {
        rule: "sub-issue-owner",
        message: `\`${reference}\` is in another owner's repository: GitHub links a sub-issue only within its parent's owner, ${owner}.`,
      };
    });
}

function findDraftRepository(stem: string, context: DraftsContext) {
  const parsed = parseStem(stem);

  return parsed === undefined
    ? resolveDraftRepository(undefined, stem, context)
    : resolveStem(parsed, context).repository;
}

function checkManifest(
  draft: Draft,
  repository: string,
  context: DraftsContext,
): {
  findings: IssueFinding[];
  meaning?: ContractMeaning | undefined;
  manifest?: DraftManifest;
} {
  const value: unknown = draft.manifest.toJS();

  if (!isPlainObject(value)) {
    return {
      findings: [
        {
          rule: "manifest",
          message: "The draft has no manifest: start it with a frontmatter holding at least `title` and `type`.",
        },
      ],
    };
  }

  const meaning = findContractMeaning(
    context.contractNames,
    isString(value.type) ? value.type : undefined,
  );

  const result = safeParse(
    createManifestSchema(context.snapshot, repository, context.contractNames),
    value,
  );

  if (!result.success) {
    return {
      meaning,
      findings: result.issues.map((issue) => {
        const path = getDotPath(issue);

        return {
          rule: "manifest",
          message: path === null ? issue.message : `${path}: ${issue.message}`,
        };
      }),
    };
  }

  return {
    meaning,
    findings: checkOwners(result.output, repository, context),
    manifest: result.output,
  };
}

function readBlockers(
  manifest: DraftManifest | undefined,
  contractNames: ContractNames,
): readonly string[] {
  const value = manifest?.[contractNames.fields.blockers];

  return isArray(value) ? value.filter(isString) : [];
}

function findCycles(
  edges: ReadonlyMap<string, readonly string[]>,
): readonly (readonly string[])[] {
  const cycles: string[][] = [];
  const done = new Set<string>();

  function visit(stem: string, path: readonly string[]) {
    const start = path.indexOf(stem);

    if (start !== -1) {
      return void cycles.push([...path.slice(start), stem]);
    }

    if (done.has(stem)) {
      return;
    }

    for (const target of edges.get(stem) ?? []) {
      visit(target, [...path, stem]);
    }

    done.add(stem);
  }

  for (const stem of edges.keys()) {
    visit(stem, []);
  }

  return cycles;
}

export function checkDrafts(
  drafts: ReadonlyMap<string, Draft>,
  context: DraftsContext,
  {
    known = drafts,
    complete,
    audience,
  }: {
    known?: ReadonlyMap<string, Draft | undefined>;
    complete: boolean;
    audience?: IssueAudience;
  },
): ReadonlyMap<string, readonly IssueFinding[]> {
  const stems = new Set([...known.keys(), ...drafts.keys()]);
  const findings = new Map<string, IssueFinding[]>();
  const edges = new Map<string, string[]>();

  function describe(stem: string, draft: Draft) {
    const repository = findDraftRepository(stem, context);

    return [
      [stem, { draft, ...checkManifest(draft, repository, context) }] as const,
    ];
  }

  const described = new Map([
    ...[...drafts].flatMap(([stem, draft]) => describe(stem, draft)),
    ...[...known].flatMap(([stem, draft]) => {
      if (draft === undefined || drafts.has(stem)) {
        return [];
      }

      try {
        return describe(stem, draft);
      } catch {
        // @debt A known draft whose repository fails to resolve silently drops out of parent and cycle checks; only its own check reports why.
        return [];
      }
    }),
  ]);

  const parents = new Map(
    [...described].flatMap(([stem, { manifest }]) => {
      return listDraftReferences(manifest?.subIssues).map((reference) => {
        return [findTarget(reference, context) ?? reference, stem] as const;
      });
    }),
  );

  for (const [stem, { manifest }] of described) {
    edges.set(
      stem,
      manifest === undefined
        ? []
        : listRelations(manifest)
            .map((reference) => findTarget(reference, context))
            .filter((target): target is string => {
              return target !== undefined && stems.has(target);
            }),
    );
  }

  function findPlan(stem: string) {
    const seen = new Set([stem]);

    for (
      let parent = parents.get(stem);
      parent !== undefined;
      parent = parents.get(parent)
    ) {
      const ancestor = described.get(parent);

      if (ancestor === undefined || seen.has(parent)) {
        // @debt The nearest plan above a published ancestor is never fetched, so a draft under one skips the **Provides** check.
        return "unresolved";
      }

      if (ancestor.meaning === "plan") {
        return parseIssueBody(ancestor.draft.body);
      }

      seen.add(parent);
    }
  }

  for (const [
    stem,
    { draft, findings: manifestFindings, meaning, manifest },
  ] of described) {
    if (!drafts.has(stem)) {
      continue;
    }

    const repository = findDraftRepository(stem, context);

    const references = [
      ...(manifest === undefined ? [] : listRelations(manifest)),
      ...[
        ...stripCode(`${manifest?.title ?? ""}\n${draft.body}`).matchAll(
          /#\{[^{}\s]*\}|(?<![\w/&])#\d+\b/g,
        ),
      ].map(([match]) => match),
    ];

    const messages = new Set<string>();

    findings.set(stem, [
      ...manifestFindings,
      ...checkDraftBody(
        draft.body,
        meaning,
        readBlockers(manifest, context.contractNames),
        context.contractNames,
        {
          subIssues: listDraftReferences(manifest?.subIssues).length,
          complete,
          audience,
        },
      ),
      ...checkIssueSpec(parseIssueBody(draft.body), {
        plan: findPlan(stem),
        trivial: (
          manifest?.[context.contractNames.fields.complexity] ===
          context.contractNames.options.trivial
        ),
        subIssues: listDraftReferences(manifest?.subIssues).length,
      }),
      ...checkNesting(meaning, described.get(parents.get(stem) ?? "")?.meaning),
      ...checkExternalSections(
        draft.body,
        meaning === undefined ? undefined : issueContracts[meaning],
        repository,
        context.repository,
      ),
      ...checkDraftHeader(
        draft.body,
        meaning === undefined ? undefined : issueContracts[meaning],
        parents.get(stem),
      ),
      ...references
        .map((reference) => {
          return checkReference(reference, stems, repository, context);
        })
        .filter((finding): finding is IssueFinding => {
          if (finding === undefined || messages.has(finding.message)) {
            return false;
          }

          messages.add(finding.message);

          return true;
        }),
    ]);
  }

  for (const cycle of findCycles(edges)) {
    const first = cycle.find((stem) => findings.has(stem)) ?? "";

    findings.get(first)?.push({
      rule: "cycle",
      message: `Cycle through \`subIssues\` or \`blockedBy\`: ${cycle.join(" → ")}.`,
    });
  }

  return findings;
}
