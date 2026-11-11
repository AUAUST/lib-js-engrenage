import { getDotPath, safeParse } from "valibot";

import { isPlainObject } from "@auaust/toolkit/isPlainObject";
import { isString } from "@auaust/toolkit/isString";

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
import { createManifestSchema } from "#tools/github/issues/drafts/utils/createManifestSchema";
import { parseReference } from "#tools/github/issues/drafts/utils/parseReference";
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

function findTarget(reference: string) {
  const parsed = parseReference(reference);

  return parsed?.kind === "draft"
    ? parsed.stem
    : parsed?.kind === "issue"
      ? String(parsed.number)
      : undefined;
}

function checkReference(
  reference: string,
  stems: ReadonlySet<string>,
): IssueFinding | undefined {
  const parsed = parseReference(reference);

  if (parsed === undefined) {
    return {
      rule: "reference",
      message: `\`${reference}\` is not a reference: write \`#123\` or \`#{new-<slug>}\`.`,
    };
  }

  if (parsed.kind === "registered") {
    return {
      rule: "unsupported-reference",
      message: `\`${reference}\` references the registered repository \`${parsed.repository}\`, which drafts do not support yet.`,
    };
  }

  if (parsed.kind === "draft" && !stems.has(parsed.stem)) {
    return {
      rule: "outside-draft",
      message: `\`${reference}\` names the draft \`${parsed.stem}\`, outside the checked drafts: check it with them, or create it.`,
    };
  }
}

function checkManifest(
  draft: Draft,
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
    createManifestSchema(context.snapshot, context.repository, contract),
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
    findings: [],
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

  const names = new Set(parseIssueBody(body).sections.map(({ name }) => name));

  return [
    ...checkIssueBody(body, meaning, protocol),
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

  for (const [stem, draft] of drafts) {
    const {
      findings: manifestFindings,
      meaning,
      manifest,
    } = checkManifest(draft, context);

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
      ...references
        .map((reference) => checkReference(reference, stems))
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
            .map(findTarget)
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
