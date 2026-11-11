import { execFileSync } from "node:child_process";

import { number, object, parse } from "valibot";
import { afterEach, describe, expect, test, vi } from "vitest";

import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { createGithubClient } from "#tools/github/issues/api/operations/createGithubClient";
import { issueProtocolSchema } from "#tools/github/issues/contract/config/schemas/issueProtocolSchema";
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

    expect(check.next).toBe(13);
  });
});
