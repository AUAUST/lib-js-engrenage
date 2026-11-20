import { execFileSync } from "node:child_process";

import { number, object, optional, parse, string } from "valibot";
import { afterEach, describe, expect, test, vi } from "vitest";

import { createCheckout } from "#tests/utils/createCheckout";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { contractNamesSchema } from "#tools/github/config/schemas/contractNamesSchema";
import { createGithubClient } from "#tools/github/issues/api/operations/createGithubClient";
import { checkIssueTree } from "#tools/github/issues/contract/operations/checkIssueTree";
import { resolveIssueCheckouts } from "#tools/github/issues/contract/operations/resolveIssueCheckouts";
import { formatIssueTreeCheck } from "#tools/github/issues/contract/utils/formatIssueTreeCheck";

vi.stubEnv("GH_TOKEN", "t");

const contractNames = contractNamesSchema.resolve(undefined, {}, "contract");

const access = {
  repository: "o/r",
  client: await createGithubClient(),
  contractNames,
};

vi.unstubAllEnvs();

interface MockIssue {
  readonly type: string;
  readonly body: string;
  readonly state?: "OPEN" | "CLOSED";
  readonly subIssues?: readonly number[];
}

const task = (number: number, header = "#10 › #11 · Roadmap") => {
  return {
    type: "Task",
    body: `${header}\n\n## Context\n\nx\n\n## Steps\n\n1. Do #${number}.\n\n## Tests\n\n- works\n`,
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
    subIssues: [12, 13, 14],
  },
  12: task(12),
  13: task(13),
  14: task(14),
  20: {
    type: "Plan",
    body: "## Goal\n\nx\n\n## Roadmap\n\n1. #21\n2. #22\n\n## Decisions\n\nx\n",
    subIssues: [21, 22],
  },
  21: task(21, "#20 · Roadmap"),
  22: task(22, "#20 · Roadmap"),
  30: {
    type: "Plan",
    body: "## Goal\n\nx\n\n## Roadmap\n\n1. #31\n2. #33\n\n## Decisions\n\nx\n",
    subIssues: [31, 33],
  },
  31: {
    type: "Plan",
    body: "## Goal\n\nx\n\n## Roadmap\n\n1. #32\n\n## Decisions\n\nx\n",
    subIssues: [32],
  },
  32: task(32, "#31 · Roadmap"),
  33: task(33, "#30 · Roadmap"),
  40: {
    type: "Plan",
    body: "## Goal\n\nx\n\n## Roadmap\n\n1. #41\n\n## Decisions\n\nx\n",
    subIssues: [41],
  },
  41: {
    type: "Segment",
    body: "#40 · Roadmap\n\n## Context\n\nx\n",
    subIssues: [42, 43, 44],
  },
  42: {
    type: "Problem",
    body: "#40 › #41 · Roadmap\n\n## Context\n\nx\n\n## Leads\n\n- fails\n",
  },
  43: {
    ...task(43, "#40 › #41 · Roadmap"),
    type: "Problem",
  },
  44: {
    type: "Problem",
    body: `${task(44, "#40 › #41 · Roadmap").body}\n## Leads\n\n- fails\n`,
  },
  50: {
    type: "Plan",
    body: "## Goal\n\nx\n\n## Roadmap\n\n1. #51\n\n## Decisions\n\nx\n",
    subIssues: [51],
  },
  51: {
    type: "Task",
    body: "#50 · Roadmap\n\n## Context\n\nx\n\n## Housekeeping\n\n1. Run `pnpm engrenage sync`.\n",
    subIssues: [52],
  },
  52: {
    ...task(52, "#50 › #51 · Roadmap"),
    state: "CLOSED",
  },
};

function connection(nodes: readonly unknown[]) {
  return {
    pageInfo: { hasNextPage: false, endCursor: null },
    nodes,
  };
}

const requestSchema = object({
  variables: object({ number: number() }),
});

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
                issue: {
                  ...renderIssue(variables.number, 2),
                  parent: null,
                },
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

  execFileSync("git", ["init", "--quiet"], { cwd: root, stdio: "pipe" });

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
      { cwd: root, stdio: "pipe" },
    );
  }

  return root;
}

function checkoutAt(root: string) {
  return [
    {
      repository: "o/r",
      root,
      ref: "HEAD",
    },
  ];
}

describe("checkIssueTree", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  test("lists every open leaf of a segment as ready", async () => {
    mockGraphql();

    const check = await checkIssueTree(access, 10, {
      checkouts: checkoutAt(createWorkingCopy()),
    });

    expect(check.ready).toEqual([
      {
        repository: "o/r",
        number: 12,
        audience: "worker",
      },
      {
        repository: "o/r",
        number: 13,
        audience: "worker",
      },
      {
        repository: "o/r",
        number: 14,
        audience: "worker",
      },
    ]);
  });

  test("names each ready Problem's agent from its shape and holds back one with both Steps and Leads", async () => {
    mockGraphql();

    const check = await checkIssueTree(access, 40, {
      checkouts: checkoutAt(createWorkingCopy()),
    });

    expect(check.ready).toEqual([
      {
        repository: "o/r",
        number: 42,
        audience: "debugger",
      },
      {
        repository: "o/r",
        number: 43,
        audience: "worker",
      },
    ]);

    expect(
      check.issues.find(({ number }) => number === 44)?.findings,
    ).toContainEqual(
      expect.objectContaining({
        rule: "exclusive-sections",
        message: expect.stringMatching(/\*\*Steps\*\* and \*\*Leads\*\*/),
      }),
    );

    expect(formatIssueTreeCheck(check)).toContain(
      "Ready: #42 debugger, #43 worker",
    );
  });

  test("names the orchestrator for a ready parent holding Housekeeping", async () => {
    mockGraphql();

    const check = await checkIssueTree(access, 50, {
      checkouts: checkoutAt(createWorkingCopy()),
    });

    expect(formatIssueTreeCheck(check)).toContain("Ready: #51 orchestrator");
  });

  test("lists only the first open task of a plan as ready until a local commit closes it", async () => {
    mockGraphql();

    const open = await checkIssueTree(access, 20, {
      checkouts: checkoutAt(createWorkingCopy()),
    });

    expect(open.ready).toEqual([
      {
        repository: "o/r",
        number: 21,
        audience: "worker",
      },
    ]);

    const closed = await checkIssueTree(access, 20, {
      checkouts: checkoutAt(
        createWorkingCopy("feat: twenty-one\n\nCloses #21"),
      ),
    });

    expect(closed.ready).toEqual([
      {
        repository: "o/r",
        number: 22,
        audience: "worker",
      },
    ]);
  });

  test("walks a nested plan only within the plan depth", async () => {
    mockGraphql();

    const checkouts = checkoutAt(createWorkingCopy());

    const [shallow, nested] = await Promise.all([
      checkIssueTree(access, 30, { checkouts }),
      checkIssueTree(access, 30, { checkouts, planDepth: 2 }),
    ]);

    expect(shallow.ready).toEqual([]);

    expect(nested.ready).toEqual([
      {
        repository: "o/r",
        number: 32,
        audience: "worker",
      },
    ]);
  });

  test("reports a walk with an open issue and no ready one as stuck, and one whose issue a local commit closes as finished", async () => {
    mockGraphql();

    const [stuck, finished] = await Promise.all([
      checkIssueTree(access, 30, {
        checkouts: checkoutAt(createWorkingCopy()),
      }),
      checkIssueTree(access, 20, {
        checkouts: checkoutAt(
          createWorkingCopy(
            "feat: twenty\n\nCloses #21\nCloses #22\nCloses #20",
          ),
        ),
      }),
    ]);

    expect(stuck.finished).toBe(false);

    expect(formatIssueTreeCheck(stuck).at(-1)).toBe(
      "Next: none, walk stuck: no open issue in turn within the plan depth has its sub-issues closed and no finding",
    );

    expect(finished).toMatchObject({ ready: [], finished: true });

    expect(formatIssueTreeCheck(finished).at(-1)).toBe(
      "Next: none, walk finished",
    );
  });

  test("prints each parent above its sub-issues, then the ready set and the next issue", async () => {
    mockGraphql();

    const check = await checkIssueTree(access, 10, {
      checkouts: checkoutAt(createWorkingCopy()),
    });

    expect(formatIssueTreeCheck(check)).toEqual([
      "Checkout: o/r at HEAD",
      "#10 Plan: open",
      "  #11 Segment: open",
      "    #12 Task: open",
      "    #13 Task: open",
      "    #14 Task: open",
      "Ready: #12 worker, #13 worker, #14 worker",
      "Next: #12",
    ]);
  });

  test("reports a task closed by a local commit and leaves it out of the ready set", async () => {
    mockGraphql();

    const root = createWorkingCopy("feat: twelve\n\nCloses #12");

    const check = await checkIssueTree(access, 10, {
      checkouts: checkoutAt(root),
    });

    const hash = execFileSync("git", ["log", "--format=%h", "-1"], {
      cwd: root,
      encoding: "utf-8",
      stdio: "pipe",
    }).trim();

    expect(formatIssueTreeCheck(check).slice(3, 6)).toEqual([
      `    #12 Task: closed by unpushed commit ${hash}`,
      `      Closes: ${hash} feat: twelve`,
      "    #13 Task: open",
    ]);

    expect(check.ready).toEqual([
      {
        repository: "o/r",
        number: 13,
        audience: "worker",
      },
      {
        repository: "o/r",
        number: 14,
        audience: "worker",
      },
    ]);
  });

  test("reads a task as open when its closing commit is pushed", async () => {
    mockGraphql();

    const root = createWorkingCopy("feat: twelve\n\nCloses #12");

    execFileSync("git", ["update-ref", "refs/remotes/origin/main", "HEAD"], {
      cwd: root,
      stdio: "pipe",
    });

    const check = await checkIssueTree(access, 10, {
      checkouts: checkoutAt(root),
    });

    expect(formatIssueTreeCheck(check)[3]).toBe("    #12 Task: open");

    expect(check.ready).toContainEqual({
      repository: "o/r",
      number: 12,
      audience: "worker",
    });
  });
});

describe("formatIssueTreeCheck", () => {
  const walked = (
    number: number,
    depth: number,
    type: string,
    state: "open" | "closed",
  ) => {
    return {
      repository: "o/r",
      number,
      depth,
      type,
      state,
      blockers: [],
      findings: [],
      openSections: [],
      towards: [],
      closes: [],
    };
  };

  test("collapses a closed segment to one line, counting its closed sub-issues and warning of open ones", () => {
    expect(
      formatIssueTreeCheck({
        repository: "o/r",
        checkouts: [],
        issues: [
          walked(12, 2, "Task", "closed"),
          walked(13, 2, "Task", "open"),
          walked(11, 1, "Segment", "closed"),
          walked(14, 1, "Task", "open"),
          walked(10, 0, "Plan", "open"),
        ],
        ready: [
          {
            repository: "o/r",
            number: 14,
            audience: "worker",
          },
        ],
        finished: false,
      }),
    ).toEqual([
      "Checkouts: none, no local commit read",
      "#10 Plan: open",
      "  #11 Segment: closed",
      "    Warning: closed with open sub-issues #13",
      "    Closed sub-issues: 1 (#12)",
      "  #14 Task: open",
      "Ready: #14 worker",
      "Next: #14",
    ]);
  });

  test("lists a closed segment's sub-issues when one of them is ready", () => {
    expect(
      formatIssueTreeCheck({
        repository: "o/r",
        checkouts: [],
        issues: [
          walked(12, 2, "Task", "closed"),
          walked(13, 2, "Task", "open"),
          walked(11, 1, "Segment", "closed"),
          walked(10, 0, "Plan", "open"),
        ],
        ready: [
          {
            repository: "o/r",
            number: 13,
            audience: "worker",
          },
        ],
        finished: false,
      }),
    ).toEqual([
      "Checkouts: none, no local commit read",
      "#10 Plan: open",
      "  #11 Segment: closed",
      "    Warning: closed with open sub-issues #13",
      "    #12 Task: closed",
      "    #13 Task: open",
      "Ready: #13 worker",
      "Next: #13",
    ]);
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
      "Checkouts: none, no local commit read",
      "#10 Plan: open",
      "  #11 Segment: open",
      "    #12 Task: open",
      `    ${toolkit}#45 Task: open`,
      `Ready: #12 worker, ${toolkit}#45 worker`,
      "Next: #12",
    ]);
  });
});

describe("checkIssueTree with another repository's checkout", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  function repositories() {
    return Promise.resolve(
      new Map([
        ["engrenage", engrenage],
        ["toolkit", toolkit],
      ]),
    );
  }

  function git(root: string, args: readonly string[]) {
    return execFileSync(
      "git",
      ["-c", "user.name=Test", "-c", "user.email=test@example.com", ...args],
      {
        cwd: root,
        encoding: "utf-8",
        stdio: "pipe",
      },
    ).trim();
  }

  async function checkWith(
    requested: readonly string[],
    linked: Readonly<Record<string, { directory: string }>> = {},
  ) {
    const checkouts = await resolveIssueCheckouts(
      {
        root: createCheckout(engrenage).root,
        repositories,
        linked,
      },
      requested,
    );

    return checkIssueTree(
      {
        ...access,
        repository: engrenage,
      },
      10,
      {
        checkouts,
      },
    );
  }

  test("reports a toolkit sub-issue closed by the toolkit checkout's commit and leaves it out of the ready set", async () => {
    mockCrossRepositoryGraphql();

    const checkout = createCheckout(toolkit).root;

    git(checkout, [
      "commit",
      "--quiet",
      "--allow-empty",
      "-m",
      "feat: x\n\nCloses #45",
    ]);

    const check = await checkWith([`toolkit=${checkout}`]);

    expect(
      check.issues.find(({ number }) => {
        return number === 45;
      })?.closedBy,
    ).toMatchObject({
      hash: git(checkout, ["log", "--format=%h", "-1"]),
    });

    expect(check.ready).toEqual([
      {
        repository: engrenage,
        number: 12,
        audience: "worker",
      },
    ]);

    expect(formatIssueTreeCheck(check).slice(0, 2)).toEqual([
      `Checkout: ${engrenage} at HEAD`,
      `Checkout: ${toolkit} at HEAD`,
    ]);
  });

  test("reads the named ref's commits instead of HEAD's", async () => {
    mockCrossRepositoryGraphql();

    const checkout = createCheckout(toolkit).root;

    git(checkout, ["switch", "--quiet", "-c", "plan"]);

    git(checkout, [
      "commit",
      "--quiet",
      "--allow-empty",
      "-m",
      "feat: x\n\nCloses #45",
    ]);

    git(checkout, ["switch", "--quiet", "main"]);

    const [head, branch] = await Promise.all([
      checkWith([`toolkit=${checkout}`]),
      checkWith([`toolkit=${checkout}@plan`]),
    ]);

    expect(head.ready).toContainEqual({
      repository: toolkit,
      number: 45,
      audience: "worker",
    });

    expect(branch.ready).not.toContainEqual({
      repository: toolkit,
      number: 45,
      audience: "worker",
    });

    expect(formatIssueTreeCheck(branch)[1]).toBe(
      `Checkout: ${toolkit} at plan`,
    );
  });

  test("fails on a checkout whose origin is another repository, naming both", async () => {
    const checkout = createCheckout(engrenage).root;

    await expect(checkWith([`toolkit=${checkout}`])).rejects.toThrow(
      `The checkout ${checkout} for ${toolkit} has origin ${engrenage}`,
    );
  });

  function createClosingCheckout() {
    const checkout = createCheckout(toolkit).root;

    git(checkout, [
      "commit",
      "--quiet",
      "--allow-empty",
      "-m",
      "feat: x\n\nCloses #45",
    ]);

    return checkout;
  }

  test("reads a linked checkout at HEAD when no explicit checkout names its repository", async () => {
    mockCrossRepositoryGraphql();

    const check = await checkWith([], {
      toolkit: { directory: createClosingCheckout() },
    });

    expect(check.ready).toEqual([
      {
        repository: engrenage,
        number: 12,
        audience: "worker",
      },
    ]);
  });

  test("prefers an explicit checkout over the linked one of the same repository", async () => {
    mockCrossRepositoryGraphql();

    const check = await checkWith([`toolkit=${createCheckout(toolkit).root}`], {
      toolkit: { directory: createClosingCheckout() },
    });

    expect(check.ready).toContainEqual({
      repository: toolkit,
      number: 45,
      audience: "worker",
    });
  });
});
