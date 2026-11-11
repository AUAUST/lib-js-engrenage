import { execFileSync } from "node:child_process";

import { afterEach, describe, expect, test, vi } from "vitest";

import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { createGithubClient } from "#tools/github/issues/api/operations/createGithubClient";
import { issueProtocolSchema } from "#tools/github/issues/contract/config/schemas/issueProtocolSchema";
import { checkGithubWrite } from "#tools/github/issues/contract/operations/checkGithubWrite";
import { checkIssue } from "#tools/github/issues/contract/operations/checkIssue";
import { fetchIssue } from "#tools/github/issues/contract/operations/fetchIssue";
import { checkIssueBody } from "#tools/github/issues/contract/utils/checkIssueBody";
import { formatIssueCheck } from "#tools/github/issues/contract/utils/formatIssueCheck";
import { parseGithubCommand } from "#tools/github/issues/contract/utils/parseGithubCommand";
import { parseIssueBody } from "#tools/github/issues/contract/utils/parseIssueBody";

vi.stubEnv("GH_TOKEN", "t");

const protocol = issueProtocolSchema.resolve(undefined, {}, "protocol");

const access = {
  repository: "o/r",
  client: await createGithubClient(),
  protocol,
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
  test("reads header, sections, steps and references outside code", () => {
    const parsed = parseIssueBody(`${task}\n\`#99\`\n`);

    expect(parsed.header?.ancestors).toEqual([10]);

    expect(parsed.sections.map(({ name }) => name)).toEqual([
      "Context",
      "Steps",
      "Tests",
    ]);

    expect(parsed.steps?.numbered).toBe(true);
    expect(parsed.steps?.items[0]?.checkpoints).toEqual(["a exists."]);
    expect(parsed.references).toEqual([10, 11]);
  });
});

describe("checkIssueBody", () => {
  test("accepts a task", () => {
    expect(checkIssueBody(task, "Task", protocol)).toEqual([]);
  });

  test("rejects a Scope section on a task, naming it", () => {
    const findings = checkIssueBody(
      `${task}\n## Scope\n\nx\n`,
      "Task",
      protocol,
    );

    expect(findings).toMatchObject([
      { rule: "unknown-section", message: expect.stringContaining("Scope") },
    ]);
  });

  test("rejects steps on a segment", () => {
    expect(
      checkIssueBody(
        "## Context\n\nx\n\n## Steps\n\n1. Do.\n",
        "Segment",
        protocol,
      ),
    ).toMatchObject([{ rule: "segment-section" }]);
  });

  test("leaves an untyped free-form body unchecked, unlike a Segment", () => {
    const body = "## Context\n\nx\n\n## Direction\n\ny\n";

    expect(checkIssueBody(body, undefined, protocol)).toEqual([]);

    expect(checkIssueBody(body, "Segment", protocol)).toMatchObject([
      {
        rule: "unknown-section",
        message: expect.stringContaining("Direction"),
      },
    ]);
  });

  test("still checks an untyped body with steps as an item", () => {
    const findings = checkIssueBody(
      `${task}\n## Scope\n\nx\n`,
      undefined,
      protocol,
    );

    expect(findings).toMatchObject([
      { rule: "unknown-section", message: expect.stringContaining("Scope") },
    ]);
  });

  test("reports pending planning in steps", () => {
    const findings = checkIssueBody(
      "## Context\n\nx\n\n## Steps\n\n1. Create the tasks as sub-issues.\n\n## Tests\n\n- t\n",
      undefined,
      protocol,
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
        json = issue.subIssues ?? [];
      } else if (rest === "/dependencies/blocked_by") {
        json = issue.blockedBy ?? [];
      } else if (rest === "/parent") {
        if (issue.parent === undefined) {
          status = 404;
        } else {
          json = { number: issue.parent };
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
                number: 11,
                state: "open",
              },
            ],
            200,
            {
              link: `<${base}/sub_issues?page=2>; rel="next"`,
            },
          );
        }

        if (url === `${base}/sub_issues?page=2`) {
          return respond([{ number: 12, state: "closed" }]);
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
  const draft = ".ai/issues/5.draft.md";

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

  test.each([
    `sed '1,/^---$/d' ${draft} | gh issue edit 5 --body-file -`,
    `tail -n +4 < ${draft} | gh issue edit 5 --body-file -`,
    `(sed '1,/^---$/d' ${draft} | gh issue edit 5 --body-file -)`,
    `sed '1,/^---$/d' ${draft} \\\n  | gh issue edit 5 \\\n    --body-file -`,
    `sed '1,/^---$/d' ${draft} |\n  gh issue edit 5 --body-file -`,
    `gh issue edit 5 --body-file <(sed '1,/^---$/d' ${draft})`,
    `gh issue edit 5 --body-file - < <(sed '1,/^---$/d' ${draft})`,
    `gh issue edit 5 --body-file - <<<"$(sed '1,/^---$/d' ${draft})"`,
  ])("reads a body piped from a draft in %s", (command) => {
    expect(readBody(command)).toEqual({ kind: "draft", path: draft });
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
        body: { kind: "draft", path: ".ai/issues/4.draft.md" },
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
      { cwd: root },
    );
  }

  function createWorkingCopy(repository: string) {
    const project = createTemporaryProject({
      "package.json": JSON.stringify({ repository }),
    });

    execFileSync("git", ["init", "--quiet"], { cwd: project.root });

    commitIn(project.root, "feat: a\n\nCloses #13\nCloses #15");
    commitIn(project.root, "cq: b\n\nTowards #11");

    return project.root;
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
      root,
    });

    const [closing, towards] = execFileSync(
      "git",
      ["log", "--format=%h", "--reverse"],
      { cwd: root, encoding: "utf-8" },
    )
      .trim()
      .split("\n");

    expect(formatIssueCheck(11, check)).toEqual([
      "#11 has open sub-issues to walk first: #14",
      `#11 has sub-issues closed by local commits: #13 (${closing})`,
      "#11 has sub-issues closed on GitHub: #12",
      `#11 was blocked by issues closed by local commits: #15 (${closing})`,
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
      root: createWorkingCopy("o/r"),
    });

    expect(own.findings).toMatchObject([
      {
        rule: "state",
        message: expect.stringContaining("closed by local commit"),
      },
    ]);

    const foreign = await checkIssue(access, 13, "worker", {
      root: createWorkingCopy("x/y"),
    });

    expect(formatIssueCheck(13, foreign)).toEqual(["#13 ready"]);
  });
});

describe("checkGithubWrite", () => {
  const draft = ".ai/issues/new-x.draft.md";
  const command = `sed '1,/^---$/d' ${draft} | gh issue create --title x --body-file -`;

  test("checks the body of a piped draft without its frontmatter", async () => {
    const project = createTemporaryProject({
      [draft]: `---\ntitle: x\ntype: Problem\n---\n\n${task}\n## Scope\n\nx\n`,
    });

    await expect(
      checkGithubWrite(command, project.root, registry, protocol),
    ).resolves.toContain("Scope");

    project.write(draft, `---\ntitle: x\n---\n\n${task}`);

    await expect(
      checkGithubWrite(command, project.root, registry, protocol),
    ).resolves.toBeUndefined();
  });

  test("checks every write of a command", async () => {
    const project = createTemporaryProject({
      [draft]: `---\ntitle: x\n---\n\n${task}\n## Scope\n\nx\n`,
    });

    await expect(
      checkGithubWrite(
        `gh issue create --title y --body 'free'\n${command}`,
        project.root,
        registry,
        protocol,
      ),
    ).resolves.toContain("Scope");
  });

  test("rejects a draft passed whole, frontmatter included", async () => {
    await expect(
      checkGithubWrite(
        `gh issue create --title x --body-file ${draft}`,
        createTemporaryProject().root,
        registry,
        protocol,
      ),
    ).resolves.toContain("frontmatter");
  });

  test("names a missing draft", async () => {
    await expect(
      checkGithubWrite(
        command,
        createTemporaryProject().root,
        registry,
        protocol,
      ),
    ).resolves.toContain(`\`${draft}\` does not exist`);
  });
});
