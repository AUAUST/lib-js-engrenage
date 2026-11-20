import { execFileSync } from "node:child_process";

import { afterEach, describe, expect, test, vi } from "vitest";

import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { contractNamesSchema } from "#tools/github/config/schemas/contractNamesSchema";
import { createGithubClient } from "#tools/github/issues/api/operations/createGithubClient";
import { checkGithubWrite } from "#tools/github/issues/contract/operations/checkGithubWrite";
import { checkIssue } from "#tools/github/issues/contract/operations/checkIssue";
import { fetchIssue } from "#tools/github/issues/contract/operations/fetchIssue";
import { parseGithubCommand } from "#tools/github/issues/contract/operations/parseGithubCommand";
import { checkIssueBody } from "#tools/github/issues/contract/utils/checkIssueBody";
import { formatIssueCheck } from "#tools/github/issues/contract/utils/formatIssueCheck";
import { parseIssueBody } from "#tools/github/issues/contract/utils/parseIssueBody";
import { renderHeader } from "#tools/github/issues/contract/utils/renderHeader";
import { stripHeaderChain } from "#tools/github/issues/contract/utils/stripHeaderChain";

vi.stubEnv("GH_TOKEN", "t");

const contractNames = contractNamesSchema.resolve(undefined, {}, "contract");

const repositoryUrl = "https://api.github.com/repos/o/r";

const access = {
  repository: "o/r",
  client: await createGithubClient(),
  contractNames,
};

vi.unstubAllEnvs();

function registry(): Promise<ReadonlyMap<string, string>> {
  return Promise.resolve(new Map());
}

function respond(
  json: unknown,
  status = 200,
  headers: Record<string, string> = {},
) {
  return Promise.resolve(
    new Response(JSON.stringify(json), {
      status,
      headers: { "content-type": "application/json", ...headers },
    }),
  );
}

const task = `#10 · [Gates](https://example.com/10#gates)

## Context

Why.

## Steps

1. Write \`a\`.
Checkpoint: a exists.

2. Write b, see #11.

## Tests

- a works
`;

describe("parseIssueBody", () => {
  test("parses a rendered header, which stripHeaderChain removes the chain of", () => {
    const header = renderHeader(
      ["#1", "AUAUST/lib-js-toolkit#2"],
      "Goal: gist",
    );

    expect(parseIssueBody(header).header).toEqual({
      ancestors: [
        { repository: undefined, number: 1 },
        { repository: "AUAUST/lib-js-toolkit", number: 2 },
      ],
      sections: ["Goal: gist"],
    });

    expect(stripHeaderChain(`${header}\n\n## Context`)).toBe(
      "Goal: gist\n\n## Context",
    );
  });

  test("reads header, sections, steps and references outside code", () => {
    const parsed = parseIssueBody(`${task}\n\`#99\`\n`);

    expect(parsed.header?.ancestors).toEqual([
      { repository: undefined, number: 10 },
    ]);

    expect(parsed.sections.map(({ name }) => name)).toEqual([
      "Context",
      "Steps",
      "Tests",
    ]);

    expect(parsed.steps?.numbered).toBe(true);

    expect(parsed.steps?.items[0]?.checkpoints).toEqual(["a exists."]);

    expect(parsed.references).toEqual([10, 11]);
  });

  test("opens no section on a heading line inside a fence", () => {
    const parsed = parseIssueBody("## Context\n\n```md\n## Steps\n```\n");

    expect(parsed.sections.map(({ name }) => name)).toEqual(["Context"]);

    expect(parsed.steps).toBeUndefined();
  });
});

describe("checkIssueBody", () => {
  test("accepts a task", () => {
    expect(checkIssueBody(task, "task", contractNames)).toEqual([]);
  });

  test("rejects a Scope section on a task, naming it", () => {
    const findings = checkIssueBody(
      `${task}\n## Scope\n\nx\n`,
      "task",
      contractNames,
    );

    expect(findings).toMatchObject([
      {
        rule: "unknown-section",
        message: expect.stringContaining("Scope"),
      },
    ]);
  });

  test("rejects steps on a segment", () => {
    expect(
      checkIssueBody(
        "## Context\n\nx\n\n## Steps\n\n1. Do.\n",
        "segment",
        contractNames,
      ),
    ).toMatchObject([{ rule: "segment-section" }]);
  });

  test("checks a body only against its declared type's contract, never a guessed one", () => {
    expect(
      checkIssueBody(`${task}\n## Scope\n\nx\n`, undefined, contractNames),
    ).toEqual([]);

    expect(
      checkIssueBody(
        "## Context\n\nx\n\n## Direction\n\ny\n",
        "segment",
        contractNames,
      ),
    ).toMatchObject([
      {
        rule: "unknown-section",
        message: expect.stringContaining("Direction"),
      },
    ]);
  });

  test("reports pending planning in steps", () => {
    const findings = checkIssueBody(
      "## Context\n\nx\n\n## Steps\n\n1. Create the tasks as sub-issues.\n\n## Tests\n\n- t\n",
      "task",
      contractNames,
    );

    expect(findings).toMatchObject([
      {
        rule: "pending-planning",
        message: expect.stringContaining("Planning"),
      },
    ]);
  });
});

function mockGithub(
  issues: Record<
    number,
    {
      body: string;
      type: string;
      blockers?: string[];
      parent?: number;
      subIssues?: { number: number; state: "open" | "closed" }[];
      blockedBy?: { number: number; state: "open" | "closed" }[];
    }
  >,
) {
  vi.stubGlobal(
    "fetch",
    vi.fn((url: string) => {
      const [
        ,
        number,
        rest = "",
      ] = /issues\/(\d+)(\/[^?]*)?(?:\?.*)?$/.exec(url) ?? [];

      const issue = issues[Number(number)];

      let json: unknown = [];
      let status = 200;

      if (issue === undefined) {
        status = 404;
      } else if (rest === "") {
        json = {
          id: Number(number),
          node_id: `I${number}`,
          number: Number(number),
          title: "t",
          body: issue.body,
          state: "open",
          type: { name: issue.type },
        };
      } else if (rest === "/issue-field-values") {
        json = [
          {
            issue_field_name: "Blockers",
            multi_select_options: (issue.blockers ?? []).map((name) => {
              return { name };
            }),
          },
        ];
      } else if (rest === "/sub_issues") {
        json = (issue.subIssues ?? []).map((child) => {
          return {
            id: child.number,
            repository_url: repositoryUrl,
            ...child,
          };
        });
      } else if (rest === "/dependencies/blocked_by") {
        json = (issue.blockedBy ?? []).map((blocker) => {
          return {
            id: blocker.number,
            repository_url: repositoryUrl,
            ...blocker,
          };
        });
      } else if (rest === "/parent") {
        if (issue.parent === undefined) {
          status = 404;
        } else {
          json = {
            number: issue.parent,
            repository_url: repositoryUrl,
          };
        }
      }

      return respond(json, status);
    }),
  );
}

describe("checkIssue", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  const plan = { body: "## Goal\n\nx\n", type: "Plan" };

  const validPlan = {
    body: "## Goal\n\nx\n\n## Roadmap\n\n1. #11\n\n## Decisions\n\nx\n",
    type: "Plan",
    subIssues: [{ number: 11, state: "open" as const }],
  };

  test("validates a Plan normally but denies its dispatch to a worker", async () => {
    mockGithub({
      10: validPlan,
      11: {
        body: task,
        type: "Task",
        parent: 10,
      },
    });

    expect((await checkIssue(access, 10)).findings).toEqual([]);

    expect(
      (await checkIssue(access, 10, "worker", { dispatch: true })).findings,
    ).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ rule: "dispatch-type" }),
      ]),
    );

    expect(
      (await checkIssue(access, 11, "worker", { dispatch: true })).findings,
    ).toEqual([]);
  });

  test.each(["Task", "Problem"])(
    "denies open children and prerequisites of a %s leaf",
    async (type) => {
      mockGithub({
        11: {
          body: task.replace("#10 ·", "Standalone"),
          type,
          subIssues: [{ number: 12, state: "open" }],
          blockedBy: [{ number: 13, state: "open" }],
        },
      });

      const rules = (
        await checkIssue(access, 11, type === "Task" ? "worker" : "debugger", {
          dispatch: true,
        })
      ).findings.map(({ rule }) => rule);

      expect(rules).toEqual(
        expect.arrayContaining(["sub-issues", "blocked-by"]),
      );
    },
  );

  test("a report-only Problem needs Steps for a worker but remains debugger input", async () => {
    mockGithub({
      11: { body: "## Context\n\nA failure.\n", type: "Problem" },
    });

    expect(
      (await checkIssue(access, 11, "worker", { dispatch: true })).findings,
    ).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          rule: "missing-section",
          message: expect.stringContaining("Steps"),
        }),
      ]),
    );

    expect(
      (await checkIssue(access, 11, "debugger", { dispatch: true })).findings,
    ).toEqual([]);
  });

  test("a debugger may investigate below Questions while a worker may not", async () => {
    mockGithub({
      10: {
        ...validPlan,
        body: `${validPlan.body}\n## Questions\n\nq?\n`,
        blockers: ["Open questions"],
      },
      11: {
        body: task,
        type: "Problem",
        parent: 10,
      },
    });

    expect(
      (await checkIssue(access, 11, "debugger", { dispatch: true })).findings,
    ).toEqual([]);

    expect(
      (await checkIssue(access, 11, "worker", { dispatch: true })).findings,
    ).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          rule: "open-section",
          message: expect.stringContaining("Ancestor #10"),
        }),
      ]),
    );
  });

  test.each(["worker", "debugger"] as const)(
    "%s rejects ancestor Planning, Outdated and prerequisites",
    async (audience) => {
      mockGithub({
        10: {
          ...validPlan,
          body: `${validPlan.body}\n## Planning\n\nx\n`,
          blockers: ["Open questions", "Outdated"],
          blockedBy: [{ number: 12, state: "open" }],
        },
        11: {
          body: task,
          type: "Problem",
          parent: 10,
        },
      });

      const findings = (
        await checkIssue(access, 11, audience, {
          dispatch: true,
        })
      ).findings;

      expect(findings.map(({ rule }) => rule)).toEqual(
        expect.arrayContaining(["open-section", "blockers", "blocked-by"]),
      );

      expect(
        findings.every(({ message }) => message.startsWith("Ancestor #10")),
      ).toBe(true);
    },
  );

  describe("open sections above the direct parent", () => {
    const grandparent = {
      ...validPlan,
      body: "## Goal\n\nx\n\n## Roadmap\n\n1. #10\n\n## Decisions\n\nx\n",
      subIssues: [{ number: 10, state: "open" as const }],
    };

    const segment = {
      body: "#9 · Context\n",
      type: "Segment",
      parent: 9,
      subIssues: [{ number: 11, state: "open" as const }],
    };

    const leaf = {
      body: task.replace("#10 ·", "#9 › #10 ·"),
      type: "Task",
      parent: 10,
    };

    async function expectRefused(rule: string, text: string) {
      const { findings } = await checkIssue(access, 11, "worker", {
        dispatch: true,
      });

      expect(findings).toContainEqual(
        expect.objectContaining({
          rule,
          message: expect.stringContaining(text),
        }),
      );
    }

    test("a grandparent's open Planning does not block the leaf", async () => {
      mockGithub({
        9: {
          ...grandparent,
          body: `${grandparent.body}\n## Planning\n\nx\n`,
          blockers: ["Open questions"],
        },
        10: segment,
        11: leaf,
      });

      expect(
        (await checkIssue(access, 11, "worker", { dispatch: true })).findings,
      ).toEqual([]);
    });

    test("the direct parent's open Planning still blocks the leaf", async () => {
      mockGithub({
        9: grandparent,
        10: {
          ...segment,
          body: `${segment.body}\n## Planning\n\nx\n`,
          blockers: ["Open questions"],
        },
        11: leaf,
      });

      await expectRefused("open-section", "Ancestor #10");
    });

    test("a grandparent's missing reference still blocks the leaf", async () => {
      mockGithub({
        9: {
          ...grandparent,
          body: `${grandparent.body}\nSee #99.\n`,
        },
        10: segment,
        11: leaf,
      });

      await expectRefused("missing-reference", "#99");
    });
  });

  test("reports malformed ancestor sections and missing references", async () => {
    mockGithub({
      10: {
        ...validPlan,
        body: "## Goal\n\nx #99\n",
      },
      11: {
        body: task,
        type: "Task",
        parent: 10,
      },
    });

    const findings = (
      await checkIssue(access, 11, "worker", { dispatch: true })
    ).findings;

    expect(findings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          rule: "missing-section",
          message: expect.stringContaining("Ancestor #10"),
        }),
        expect.objectContaining({
          rule: "missing-reference",
          message: expect.stringContaining("#99"),
        }),
      ]),
    );
  });

  test("reports cycles, mismatched chains and unavailable ancestors", async () => {
    mockGithub({
      10: {
        body: "#11 · Context\n",
        type: "Segment",
        parent: 11,
        subIssues: [{ number: 11, state: "open" }],
      },
      11: {
        body: task.replace("#10 ·", "#99 ·"),
        type: "Task",
        parent: 10,
      },
    });

    expect(
      (await checkIssue(access, 11, "worker", { dispatch: true })).findings,
    ).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          rule: "ancestor-cycle",
          message: expect.stringContaining("#11"),
        }),
        expect.objectContaining({ rule: "header-chain" }),
      ]),
    );

    mockGithub({
      11: {
        body: task,
        type: "Task",
        parent: 10,
      },
    });

    expect(
      (await checkIssue(access, 11, "worker", { dispatch: true })).findings,
    ).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          rule: "ancestor-unavailable",
          message: expect.stringContaining("Ancestor #10"),
        }),
      ]),
    );
  });

  test("a task with Questions and Blockers is valid but not ready", async () => {
    mockGithub({
      10: plan,
      11: {
        body: `${task.replace("#10 ·", "#10 ·")}\n## Questions\n\nq?\n`,
        type: "Task",
        blockers: ["Open questions"],
        parent: 10,
      },
    });

    const findings = (await checkIssue(access, 11)).findings;

    expect(findings.map(({ rule }) => rule)).toEqual(["open-section"]);
  });

  test("Questions without Blockers reports the stale field", async () => {
    mockGithub({
      10: plan,
      11: {
        body: `${task}\n## Questions\n\nq?\n`,
        type: "Task",
        parent: 10,
      },
    });

    const rules = (await checkIssue(access, 11)).findings.map(
      ({ rule }) => rule,
    );

    expect(rules).toContain("stale-field");
  });

  test("Blockers asking questions without an open section reports one finding at dispatch", async () => {
    mockGithub({
      10: plan,
      11: {
        body: task,
        type: "Task",
        blockers: ["Open questions"],
        parent: 10,
      },
    });

    const rules = (
      await checkIssue(access, 11, "worker", { dispatch: true })
    ).findings.map(({ rule }) => rule);

    expect(
      rules.filter((rule) => {
        return rule === "stale-field" || rule === "blockers";
      }),
    ).toEqual(["stale-field"]);
  });

  test("a header chain naming a non-ancestor is not ready", async () => {
    mockGithub({
      10: plan,
      12: plan,
      11: {
        body: task.replace("#10 ·", "#12 ·"),
        type: "Task",
        parent: 10,
      },
    });

    const rules = (await checkIssue(access, 11)).findings.map(
      ({ rule }) => rule,
    );

    expect(rules).toContain("header-chain");
  });

  test("a problem being drafted is not ready for a debugger", async () => {
    mockGithub({
      11: {
        body: "## Context\n\nx\n",
        type: "Problem",
        blockers: ["Drafting"],
      },
    });

    const rules = (await checkIssue(access, 11, "debugger")).findings.map(
      ({ rule }) => {
        return rule;
      },
    );

    expect(rules).toEqual(["blockers"]);
  });
});

describe("fetchIssue", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  const base = "https://api.github.com/repos/o/r/issues/10";

  test("merges the pages of a list route and resolves a missing parent to none", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn((url: string) => {
        if (url === base) {
          return respond({
            id: 10,
            node_id: "I10",
            number: 10,
            title: "t",
            body: task,
            state: "open",
            type: { name: "Task" },
          });
        }

        if (url === `${base}/sub_issues`) {
          return respond(
            [
              {
                id: 11,
                number: 11,
                state: "open",
                repository_url: "https://api.github.com/repos/o/r",
              },
            ],
            200,
            {
              link: `<${base}/sub_issues?page=2>; rel="next"`,
            },
          );
        }

        if (url === `${base}/sub_issues?page=2`) {
          return respond([
            {
              id: 12,
              number: 12,
              state: "closed",
              repository_url: "https://api.github.com/repos/o/r",
            },
          ]);
        }

        if (url === `${base}/parent`) {
          return respond({ message: "Not Found" }, 404);
        }

        return respond([]);
      }),
    );

    await expect(fetchIssue(access, 10)).resolves.toMatchObject({
      subIssues: [
        { number: 11, state: "open" },
        { number: 12, state: "closed" },
      ],
      parent: undefined,
    });
  });

  test("fails on a missing issue, naming its route", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn((url: string) => {
        return url === base
          ? respond({ message: "Not Found" }, 404)
          : respond([]);
      }),
    );

    await expect(fetchIssue(access, 10)).rejects.toThrow(
      "/repos/o/r/issues/10 failed with 404",
    );
  });
});

describe("parseGithubCommand", () => {
  const body = "## Context\n\nhello world";

  function readBody(command: string) {
    const writes = parseGithubCommand(command);

    expect(writes).toHaveLength(1);

    return writes[0]?.body;
  }

  test.each([
    `gh issue create --title t --body-file - <<'EOF'\n${body}\nEOF`,
    `gh issue create --title t --body "$(cat <<'EOF'\n${body}\nEOF\n)"`,
    `cat <<'EOF' | gh issue create --title t --body-file -\n${body}\nEOF`,
    `gh issue create --title t --body '${body}'`,
    `gh issue create --title t --body "${body}"`,
    `gh issue create --title t --body="${body}"`,
  ])("reads the body of %s", (command) => {
    expect(readBody(command)).toEqual({ kind: "text", text: body });
  });

  test("reads a body file and reports an unreadable body", () => {
    expect(readBody("gh issue edit 5 --body-file ./b.md")).toEqual({
      kind: "file",
      path: "./b.md",
    });

    expect(readBody("gh issue edit 5 --body $(cat b.md)")).toEqual({
      kind: "unreadable",
    });

    expect(readBody("gh issue edit 5 --body-file - < b.md")).toEqual({
      kind: "file",
      path: "b.md",
    });

    expect(readBody("cat b.md | gh issue edit 5 --body-file -")).toEqual({
      kind: "unreadable",
    });

    expect(
      readBody(
        "for n in 4 5; do sed 1d .ai/issues/$n.draft.md | gh issue edit $n --body-file -; done",
      ),
    ).toEqual({ kind: "unreadable" });
  });

  test("resolves relative body files from literal `cd`s", () => {
    expect(readBody("cd sub && gh issue edit 1 --body-file body.md")).toEqual({
      kind: "file",
      path: "sub/body.md",
    });

    expect(readBody("cd /abs && cd x && gh issue edit 1 -F b.md")).toEqual({
      kind: "file",
      path: "/abs/x/b.md",
    });
  });

  test("makes relative body files after an unreadable `cd` unreadable", () => {
    expect(readBody(`cd "$S" && gh issue edit 1 --body-file body.md`)).toEqual({
      kind: "unreadable",
    });

    expect(
      readBody(`cd "$S" && gh issue edit 1 --body-file /tmp/b.md`),
    ).toEqual({ kind: "file", path: "/tmp/b.md" });

    expect(
      readBody(`cd "$S" && cd /abs && gh issue edit 1 --body-file body.md`),
    ).toEqual({ kind: "file", path: "/abs/body.md" });

    expect(
      readBody(`cd "$S" && cd sub && gh issue edit 1 --body-file body.md`),
    ).toEqual({ kind: "unreadable" });
  });

  test("reads every write of a command", () => {
    const writes = parseGithubCommand(
      [
        "# publish",
        `sed '1,/^---$/d' .ai/issues/4.draft.md | gh issue edit 4 --body-file -`,
        `gh issue edit 5 --repo o/r --title "a b" --body-file - <<'EOF'\n${body}\nEOF`,
        `true && gh issue comment 6 --body 'x'; gh issue list`,
      ].join("\n"),
    );

    expect(writes).toEqual([
      expect.objectContaining({
        action: "edit",
        number: 4,
        body: { kind: "unreadable" },
      }),
      expect.objectContaining({
        action: "edit",
        number: 5,
        repository: "o/r",
        title: "a b",
        body: { kind: "text", text: body },
      }),
      expect.objectContaining({
        action: "comment",
        number: 6,
        body: { kind: "text", text: "x" },
      }),
    ]);
  });

  test("never takes text inside a heredoc for a write", () => {
    expect(
      parseGithubCommand(
        `gh issue create --title t --body-file - <<'EOF'\nRun gh issue edit 5 --body x.\nEOF`,
      ),
    ).toHaveLength(1);
  });
});

describe("parseGithubCommand shell constructs", () => {
  test.each([
    "echo $(gh issue comment 5 --body x)",
    "echo `gh issue comment 5 --body x`",
    "true && A=0 gh issue comment 5 --body x",
    "gh issue create --title t --body-file - <<'EOF'\nx\nEOF",
  ])("reaches the write in %s", (command) => {
    expect(parseGithubCommand(command)).toHaveLength(1);
  });

  test("keeps a quoted `;` inside its argument", () => {
    expect(parseGithubCommand("gh issue comment 5 --body 'a; b'")).toEqual([
      expect.objectContaining({
        body: { kind: "text", text: "a; b" },
      }),
    ]);
  });

  test("checkGithubWrite denies an unterminated quote after a valid first line", async () => {
    const project = createTemporaryProject({});

    await expect(
      checkGithubWrite(
        "gh issue list\necho 'y",
        project.root,
        registry,
        contractNames,
      ),
    ).resolves.toContain("the command is not valid shell:");
  });
});

describe("formatIssueCheck", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  function commitIn(root: string, message: string) {
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

  function createWorkingCopy(repository: string) {
    const project = createTemporaryProject({
      "package.json": JSON.stringify({ repository }),
    });

    execFileSync("git", ["init", "--quiet"], {
      cwd: project.root,
      stdio: "pipe",
    });

    commitIn(project.root, "feat: a\n\nCloses #13\nCloses #15");
    commitIn(project.root, "cq: b\n\nTowards #11");

    return project.root;
  }

  function checkoutAt(root: string, repository = "o/r") {
    return [
      {
        repository,
        root,
        ref: "HEAD",
      },
    ];
  }

  test("reports related issues by state, counting local closes, and commits towards it", async () => {
    mockGithub({
      11: {
        body: task.replace("#10 ·", "Standalone"),
        type: "Task",
        subIssues: [
          { number: 12, state: "closed" },
          { number: 13, state: "open" },
          { number: 14, state: "open" },
        ],
        blockedBy: [{ number: 15, state: "open" }],
      },
    });

    const root = createWorkingCopy("o/r");

    const check = await checkIssue(access, 11, "worker", {
      dispatch: true,
      checkouts: checkoutAt(root),
    });

    const [closing, towards] = execFileSync(
      "git",
      ["log", "--format=%h", "--reverse"],
      {
        cwd: root,
        encoding: "utf-8",
        stdio: "pipe",
      },
    )
      .trim()
      .split("\n");

    expect(formatIssueCheck(11, check)).toEqual([
      "#11 has open sub-issues to walk first: #14",
      `#11 has sub-issues closed by unpushed commits: #13 (${closing})`,
      "#11 has sub-issues closed on GitHub: #12",
      `#11 was blocked by issues closed by unpushed commits: #15 (${closing})`,
      `#11 has a commit towards it: ${towards} cq: b`,
      "#11 itself: #11 has open sub-issue #14: finish it first.",
    ]);
  });

  test("ignores local commits of another repository and reports a local close of the issue itself", async () => {
    const standalone = {
      body: task.replace("#10 ·", "Standalone"),
      type: "Task",
    };

    mockGithub({ 11: standalone, 13: standalone });

    const own = await checkIssue(access, 13, "worker", {
      checkouts: checkoutAt(createWorkingCopy("o/r")),
    });

    expect(own.findings).toMatchObject([
      {
        rule: "state",
        message: expect.stringContaining("closed by unpushed commit"),
      },
    ]);

    const foreign = await checkIssue(access, 13, "worker", {
      checkouts: checkoutAt(createWorkingCopy("x/y"), "x/y"),
    });

    expect(formatIssueCheck(13, foreign)).toEqual(["#13 ready"]);
  });

  test("reads the issue itself as open when its closing commit is pushed", async () => {
    const standalone = {
      body: task.replace("#10 ·", "Standalone"),
      type: "Task",
    };

    mockGithub({ 11: standalone, 13: standalone });

    const root = createWorkingCopy("o/r");

    execFileSync("git", ["update-ref", "refs/remotes/origin/main", "HEAD"], {
      cwd: root,
      stdio: "pipe",
    });

    const check = await checkIssue(access, 13, "worker", {
      checkouts: checkoutAt(root),
    });

    expect(formatIssueCheck(13, check)).toEqual(["#13 ready"]);
  });
});

describe("checkGithubWrite", () => {
  const draft = ".ai/issues/5.draft.md";
  const command = `gh issue edit 5 --repo o/r --body-file ${draft}`;

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  function mockProblem() {
    vi.stubEnv("GH_TOKEN", "t");

    mockGithub({
      5: { body: "", type: "Problem" },
    });
  }

  test("checks a draft file as a direct write of its content against the issue's type", async () => {
    mockProblem();

    const project = createTemporaryProject({
      [draft]: `${task}\n## Scope\n\nx\n`,
    });

    await expect(
      checkGithubWrite(command, project.root, registry, contractNames),
    ).resolves.toContain("Scope");

    project.write(draft, task);

    await expect(
      checkGithubWrite(command, project.root, registry, contractNames),
    ).resolves.toBeUndefined();
  });

  test("denies `gh issue create`, naming the planning commands", async () => {
    const project = createTemporaryProject({
      [draft]: `${task}\n## Scope\n\nx\n`,
    });

    const reason = await checkGithubWrite(
      `gh issue create --title y --body '## Scope'`,
      project.root,
      registry,
      contractNames,
    );

    expect(reason).toContain("gh issue create:");

    expect(reason).toContain("pnpm engrenage planning issue create");

    mockProblem();

    await expect(
      checkGithubWrite(
        `gh issue create --title y --body 'free'\n${command}`,
        project.root,
        registry,
        contractNames,
      ),
    ).resolves.toContain("gh issue create:");
  });

  test("reads a body file relative to a literal `cd`", async () => {
    mockProblem();

    const project = createTemporaryProject({ "sub/body.md": task });

    await expect(
      checkGithubWrite(
        "cd sub && gh issue edit 5 --repo o/r --body-file body.md",
        project.root,
        registry,
        contractNames,
      ),
    ).resolves.toBeUndefined();
  });

  test("names a missing draft", async () => {
    await expect(
      checkGithubWrite(
        command,
        createTemporaryProject().root,
        registry,
        contractNames,
      ),
    ).resolves.toContain(`\`${draft}\` does not exist`);
  });
});
