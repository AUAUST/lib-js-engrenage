import { getDotPath, safeParse } from "valibot";

import { isPlainObject } from "@auaust/toolkit/isPlainObject";
import { isString } from "@auaust/toolkit/isString";

import { splitRepository } from "#tools/github/issues/api/index";
import { issueContracts } from "#tools/github/issues/contract/constants";
import {
  checkIssueBody,
  findContractMeaning,
  parseIssueBody,
  stripCode,
  type ContractMeaning,
  type IssueContract,
  type IssueFinding,
  type IssueProtocol,
} from "#tools/github/issues/contract/index";
import { headerPlaceholder } from "#tools/github/issues/drafts/constants";
import { createManifestSchema } from "#tools/github/issues/drafts/utils/createManifestSchema";
import { listDraftReferences } from "#tools/github/issues/drafts/utils/listDraftReferences";
import { parseReference } from "#tools/github/issues/drafts/utils/parseReference";
import { parseStem } from "#tools/github/issues/drafts/utils/parseStem";
import { readDraftHeader } from "#tools/github/issues/drafts/utils/readDraftHeader";
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

  if (resolved.parsed.kind === "draft" && !stems.has(resolved.stem)) {
    return {
      rule: "outside-draft",
      message: `\`${reference}\` names the draft \`${resolved.stem}\`, outside the checked drafts: check it with them, or create it.`,
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
    ? context.repository
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
    context.protocol,
    isString(value.type) ? value.type : undefined,
  );

  const contract = meaning === undefined ? undefined : issueContracts[meaning];

  const result = safeParse(
    createManifestSchema(context.snapshot, repository, contract),
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

function checkBody(
  body: string,
  meaning: ContractMeaning | undefined,
  protocol: IssueProtocol,
): IssueFinding[] {
  const contract:
    | IssueContract
    | undefined = meaning === undefined ? undefined : issueContracts[meaning];

  const generated = contract?.generated ?? [];

  const { sections } = parseIssueBody(body);
  const names = new Set(sections.map(({ name }) => name));

  return [
    ...checkIssueBody(body, meaning, protocol),
    ...sections
      .filter(({ content }) => content === "")
      .map(({ name }) => {
        return {
          rule: "empty-section",
          message: `**${name}** is empty: fill it or remove it.`,
        };
      }),
    ...generated
      .filter((name) => names.has(name))
      .map((name) => {
        return {
          rule: "generated-section",
          message: `**${name}** is generated at publish from \`subIssues\`: remove it from the body.`,
        };
      }),
  ];
}

function checkHeader(
  body: string,
  contract: IssueContract | undefined,
  parent: string | undefined,
): IssueFinding[] {
  const header = readDraftHeader(body);

  if (header !== undefined && /^#(?:\d|\{)/.test(header)) {
    return [
      {
        rule: "header",
        message: `The header starts with a reference: \`publish\` generates the ancestor chain \`#<plan> › … › #<parent> · \`, so keep only \`${headerPlaceholder}\`.`,
      },
    ];
  }

  if (contract?.hasHeader !== true || parent === undefined) {
    return [];
  }

  if (header === undefined) {
    return [
      {
        rule: "header",
        message: `\`${parent}\` lists the draft in \`subIssues\` but it has no header line: write \`${headerPlaceholder}\` before the first section.`,
      },
    ];
  }

  return header === headerPlaceholder
    ? [
        {
          rule: "header",
          message: `The header line is still the placeholder \`${headerPlaceholder}\`: fill in its sections and gist.`,
        },
      ]
    : [];
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
): ReadonlyMap<string, readonly IssueFinding[]> {
  const stems = new Set(drafts.keys());
  const findings = new Map<string, IssueFinding[]>();
  const edges = new Map<string, string[]>();

  const checked = new Map(
    [...drafts].map(([stem, draft]) => {
      const repository = findDraftRepository(stem, context);

      return [
        stem,
        { draft, ...checkManifest(draft, repository, context) },
      ] as const;
    }),
  );

  const parents = new Map(
    [...checked].flatMap(([stem, { manifest }]) => {
      return listDraftReferences(manifest?.subIssues).map((reference) => {
        return [findTarget(reference, context) ?? reference, stem] as const;
      });
    }),
  );

  for (const [
    stem,
    { draft, findings: manifestFindings, meaning, manifest },
  ] of checked) {
    const references = [
      ...(manifest === undefined ? [] : listRelations(manifest)),
      ...[...stripCode(draft.body).matchAll(/#\{[^{}\s]*\}/g)].map(
        ([match]) => match,
      ),
    ];

    const messages = new Set<string>();

    findings.set(stem, [
      ...manifestFindings,
      ...checkBody(draft.body, meaning, context.protocol),
      ...checkHeader(
        draft.body,
        meaning === undefined ? undefined : issueContracts[meaning],
        parents.get(stem),
      ),
      ...references
        .map((reference) => checkReference(reference, stems, context))
        .filter((finding): finding is IssueFinding => {
          if (finding === undefined || messages.has(finding.message)) {
            return false;
          }

          messages.add(finding.message);

          return true;
        }),
    ]);

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

  for (const cycle of findCycles(edges)) {
    const [first = ""] = cycle;

    findings.get(first)?.push({
      rule: "cycle",
      message: `Cycle through \`subIssues\` or \`blockedBy\`: ${cycle.join(" → ")}.`,
    });
  }

  return findings;
}
