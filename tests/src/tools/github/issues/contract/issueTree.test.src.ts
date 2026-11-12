import { execFileSync } from "node:child_process";

import { number, object, optional, parse, string } from "valibot";
import { afterEach, describe, expect, test, vi } from "vitest";

import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { issueProtocolSchema } from "#tools/github/config/schemas/issueProtocolSchema";
import { createGithubClient } from "#tools/github/issues/api/operations/createGithubClient";
import { checkIssueTree } from "#tools/github/issues/contract/operations/checkIssueTree";
import { formatIssueTreeCheck } from "#tools/github/issues/contract/utils/formatIssueTreeCheck";

vi.stubEnv("GH_TOKEN", "t");

const protocol = issueProtocolSchema.resolve(undefined, {}, "protocol");

const access = {
  repository: "o/r",
  client: await createGithubClient(),
  protocol,
};

vi.unstubAllEnvs();

interface MockIssue {
  readonly type: string;
  readonly body: string;
  readonly state?: "OPEN" | "CLOSED";
  readonly subIssues?: readonly number[];
}

const task = (number: number) => {
  return {
    type: "Task",
    body: `#10 › #11 · Roadmap\n\n## Context\n\nx\n\n## Steps\n\n1. Do #${number}.\n\n## Tests\n\n- works\n`,
  };
};

const tree: Record<number, MockIssue> = {
  10: {
    type: "Plan",
    body: "## Goal\n\nx\n\n## Roadmap\n\n1. #11\n\n## Decisions\n\nx\n",
    subIssues: [11],
  },
  11: {
    type: "Segment",
    body: "#10 · Roadmap\n\n## Context\n\nx\n",
    subIssues: [12, 13],
  },
  12: task(12),
  13: task(13),
};

function connection(nodes: readonly unknown[]) {
  return {
    pageInfo: { hasNextPage: false, endCursor: null },
    nodes,
  };
}

const requestSchema = object({ variables: object({ number: number() }) });

function renderIssue(number: number, levels: number): Record<string, unknown> {
  const issue = tree[number];

  if (issue === undefined) {
    throw new Error(`no mock issue #${number}`);
  }

  const subIssues = issue.subIssues ?? [];

  return {
    id: `I${number}`,
    number,
    repository: { nameWithOwner: "o/r" },
    title: "t",
    body: issue.body,
    state: issue.state ?? "OPEN",
    issueType: { name: issue.type },
    issueFieldValues: connection([]),
    blockedBy: connection([]),
    subIssuesSummary: { total: subIssues.length },
    ...(levels > 0
      ? {
          subIssues: connection(
            subIssues.map((sub) => renderIssue(sub, levels - 1)),
          ),
        }
      : {}),
  };
}

function mockGraphql() {
  vi.stubGlobal(
    "fetch",
    vi.fn((_url: string, { body }: { body: string }) => {
      const { variables } = parse(requestSchema, JSON.parse(body));

      return Promise.resolve(
        new Response(
          JSON.stringify({
            data: {
              repository: {
                issue: { ...renderIssue(variables.number, 2), parent: null },
              },
            },
          }),
          {
            headers: { "content-type": "application/json" },
          },
        ),
      );
    }),
  );
}

function createWorkingCopy(message?: string) {
  const { root } = createTemporaryProject({
    "package.json": JSON.stringify({ repository: "o/r" }),
  });

  execFileSync("git", ["init", "--quiet"], { cwd: root });

  if (message !== undefined) {
    execFileSync(
      "git",
      [
        "-c",
        "user.name=Test",
        "-c",
        "user.email=test@example.com",
        "commit",
        "--quiet",
        "--allow-empty",
        "-m",
        message,
      ],
      { cwd: root },
    );
  }

  return root;
}

describe("checkIssueTree", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  test("reports the tree in walk order and names the first open task next", async () => {
    mockGraphql();

    const check = await checkIssueTree(access, 10, {
      root: createWorkingCopy(),
    });

    expect(formatIssueTreeCheck(check)).toEqual([
      "    #12 Task: open",
      "    #13 Task: open",
      "  #11 Segment: open",
      "#10 Plan: open",
      "Next: #12",
    ]);
  });

  test("reports a task closed by a local commit and skips it for the next issue", async () => {
    mockGraphql();

    const root = createWorkingCopy("feat: twelve\n\nCloses #12");

    const check = await checkIssueTree(access, 10, { root });

    const hash = execFileSync("git", ["log", "--format=%h", "-1"], {
      cwd: root,
      encoding: "utf-8",
    }).trim();

    expect(formatIssueTreeCheck(check).slice(0, 3)).toEqual([
      `    #12 Task: closed by local commit ${hash}`,
      `      Closes: ${hash} feat: twelve`,
      "    #13 Task: open",
    ]);

    expect(check.next).toEqual({ repository: "o/r", number: 13 });
  });
});

const engrenage = "AUAUST/lib-js-engrenage";
const toolkit = "AUAUST/lib-js-toolkit";

const crossRequestSchema = object({
  variables: object({
    owner: optional(string()),
    name: optional(string()),
    number: optional(number()),
    id: optional(string()),
  }),
});

function renderCrossIssue(
  repository: string,
  number: number,
  children: readonly unknown[],
  hasNextPage = false,
) {
  const body = repository === toolkit
    ? `${engrenage}#10 › ${engrenage}#11 · Roadmap\n\n## Context\n\nx\n\n## Steps\n\n1. Do it.\n\n## Tests\n\n- works\n`
    : (tree[number]?.body ?? "");

  return {
    id: `${repository}#${number}`,
    number,
    repository: {
      nameWithOwner: repository,
    },
    title: "t",
    body,
    state: "OPEN",
    issueType: {
      name: tree[number]?.type ?? "Task",
    },
    issueFieldValues: connection([]),
    blockedBy: connection([]),
    subIssuesSummary: {
      total: children.length + (hasNextPage ? 1 : 0),
    },
    subIssues: {
      pageInfo: { hasNextPage, endCursor: hasNextPage ? "c" : null },
      nodes: children,
    },
  };
}

function mockCrossRepositoryGraphql() {
  const queried: string[] = [];

  vi.stubGlobal(
    "fetch",
    vi.fn((_url: string, { body }: { body: string }) => {
      const { variables } = parse(crossRequestSchema, JSON.parse(body));

      if (variables.id !== undefined) {
        return Promise.resolve(
          new Response(
            JSON.stringify({
              data: {
                node: {
                  connection: connection([
                    {
                      number: 45,
                      repository: { nameWithOwner: toolkit },
                    },
                  ]),
                },
              },
            }),
            {
              headers: { "content-type": "application/json" },
            },
          ),
        );
      }

      const repository = `${variables.owner ?? ""}/${variables.name ?? ""}`;

      queried.push(`${repository}#${variables.number ?? 0}`);

      const issue = repository === toolkit
        ? {
            ...renderCrossIssue(toolkit, 45, []),
            parent: {
              number: 11,
              repository: {
                nameWithOwner: engrenage,
              },
              issueType: {
                name: "Segment",
              },
              parent: {
                number: 10,
                repository: { nameWithOwner: engrenage },
                issueType: { name: "Plan" },
                parent: null,
              },
            },
          }
        : {
            ...renderCrossIssue(engrenage, 10, [
              renderCrossIssue(
                engrenage,
                11,
                [renderCrossIssue(engrenage, 12, [])],
                true,
              ),
            ]),
            parent: null,
          };

      return Promise.resolve(
        new Response(
          JSON.stringify({
            data: {
              repository: { issue },
            },
          }),
          {
            headers: { "content-type": "application/json" },
          },
        ),
      );
    }),
  );

  return queried;
}

describe("checkIssueTree across repositories", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  test("fetches a toolkit sub-issue from toolkit and passes its header chain", async () => {
    const queried = mockCrossRepositoryGraphql();

    const check = await checkIssueTree(
      { ...access, repository: engrenage },
      10,
    );

    expect(queried).toContain(`${toolkit}#45`);

    expect(formatIssueTreeCheck(check)).toEqual([
      "    #12 Task: open",
      `    ${toolkit}#45 Task: open`,
      "  #11 Segment: open",
      "#10 Plan: open",
      "Next: #12",
    ]);
  });
});
