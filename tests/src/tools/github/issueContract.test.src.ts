import { afterEach, describe, expect, test, vi } from "vitest";

import { checkIssue } from "#tools/github/operations/checkIssue";
import { checkIssueBody } from "#tools/github/utils/checkIssueBody";
import { parseGithubCommand } from "#tools/github/utils/parseGithubCommand";
import { parseIssueBody } from "#tools/github/utils/parseIssueBody";

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
    expect(checkIssueBody(task, "Task")).toEqual([]);
  });

  test("rejects a Scope section on a task, naming it", () => {
    const findings = checkIssueBody(`${task}\n## Scope\n\nx\n`, "Task");

    expect(findings).toMatchObject([
      { rule: "unknown-section", message: expect.stringContaining("Scope") },
    ]);
  });

  test("rejects steps on a segment", () => {
    expect(
      checkIssueBody("## Context\n\nx\n\n## Steps\n\n1. Do.\n", "Segment"),
    ).toMatchObject([{ rule: "segment-section" }]);
  });

  test("reports pending planning in steps", () => {
    const findings = checkIssueBody(
      "## Context\n\nx\n\n## Steps\n\n1. Create the tasks as sub-issues.\n\n## Tests\n\n- t\n",
      undefined,
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
    }
  >,
) {
  vi.stubGlobal(
    "fetch",
    vi.fn((url: string) => {
      const [, number, rest = ""] = /issues\/(\d+)(\/.*)?$/.exec(url) ?? [];

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
      } else if (rest === "/parent") {
        if (issue.parent === undefined) {
          status = 404;
        } else {
          json = { number: issue.parent };
        }
      }

      return Promise.resolve(new Response(JSON.stringify(json), { status }));
    }),
  );
}

describe("checkIssue", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  const access = { repository: "o/r", token: "t" };
  const plan = { body: "## Goal\n\nx\n", type: "Plan" };

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

    const findings = await checkIssue(access, 11);

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

    const rules = (await checkIssue(access, 11)).map(({ rule }) => rule);

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

    const rules = (await checkIssue(access, 11)).map(({ rule }) => rule);

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

    const rules = (await checkIssue(access, 11, "debugger")).map(({ rule }) => {
      return rule;
    });

    expect(rules).toEqual(["blockers"]);
  });
});

describe("parseGithubCommand", () => {
  const body = "## Context\n\nhello world";

  test.each([
    `gh issue create --title t --body-file - <<'EOF'\n${body}\nEOF`,
    `gh issue create --title t --body "$(cat <<'EOF'\n${body}\nEOF\n)"`,
    `gh issue create --title t --body '${body}'`,
    `gh issue create --title t --body "${body}"`,
  ])("reads the body of %s", (command) => {
    expect(parseGithubCommand(command)?.body).toEqual({
      kind: "text",
      text: body,
    });
  });

  test("reads a body file and reports an unreadable body", () => {
    expect(
      parseGithubCommand("gh issue edit 5 --body-file ./b.md")?.body,
    ).toEqual({ kind: "file", path: "./b.md" });

    expect(
      parseGithubCommand("gh issue edit 5 --body $(cat b.md)")?.body,
    ).toEqual({ kind: "unreadable" });

    expect(
      parseGithubCommand("gh issue edit 5 --body-file - < b.md")?.body,
    ).toEqual({ kind: "file", path: "b.md" });
  });
});
