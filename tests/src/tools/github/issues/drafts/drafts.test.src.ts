import { assert, describe, expect, test, vi } from "vitest";

import { loadConfig } from "#project/config/operations/loadConfig";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { fetchGithubSnapshot } from "#tools/github/issues/api/operations/fetchGithubSnapshot";
import { checkIssues } from "#tools/github/issues/drafts/operations/checkIssues";
import { checkIssueViews } from "#tools/github/issues/drafts/operations/checkIssueViews";
import { createDraft } from "#tools/github/issues/drafts/operations/createDraft";
import { readDraft } from "#tools/github/issues/drafts/operations/readDraft";
import { splitBodySections } from "#tools/github/issues/drafts/utils/splitBodySections";

function entity(name: string) {
  return {
    id: 1,
    nodeId: "N",
    name,
    description: `${name}.`,
  };
}

function field(name: string, dataType: string, options: readonly string[]) {
  return {
    ...entity(name),
    dataType,
    options: options.map((option) => {
      return {
        id: 2,
        name: option,
        description: null,
      };
    }),
  };
}

function type(name: string, pinnedFields: readonly string[]) {
  return {
    ...entity(name),
    enabled: true,
    pinnedFields,
  };
}

const snapshot = {
  repositories: {
    app: {
      repository: "AUAUST/app",
      id: 3,
      nodeId: "R",
      labels: [entity("Tests"), entity("Tooling")],
    },
  },
  organizations: {
    AUAUST: {
      types: [
        type("Plan", ["Blockers"]),
        type("Segment", ["Blockers", "Complexity"]),
        type("Task", ["Blockers", "Nature", "Complexity"]),
        type("Problem", ["Blockers", "Defect"]),
        type("Resource", ["Blockers"]),
        type("Idea", ["Blockers"]),
      ],
      fields: [
        field("Blockers", "multi_select", ["Drafting", "Open questions"]),
        field("Complexity", "single_select", ["Trivial", "Involved"]),
        field("Defect", "single_select", ["Bug", "Debt"]),
        field("Nature", "single_select", ["Chore", "Feature", "Improvement"]),
      ],
    },
  },
};

const plan = `---
title: Plan
type: Plan
labels: [Tooling]
subIssues:
  - ref: "#{new-first}"
    gist: First step
    sections: []
---

## Goal

g

## Decisions

d

## Done when

- d
`;

const first = `---
title: First
type: Task
labels: [Tooling]
Nature: Feature
Complexity: Trivial
---

Goal: the first step

## Context

c

## Done when

- Done.
- Checked.

## Tests

- t → passes
`;

vi.mock(
  import("#tools/github/issues/api/operations/createGithubClient"),
  () => {
    return {
      createGithubClient: vi.fn(async () => {
        return {} as never;
      }),
    };
  },
);

vi.mock(
  import("#tools/github/issues/api/operations/fetchGithubSnapshot"),
  () => {
    return {
      fetchGithubSnapshot: vi.fn(async (config) => {
        await config.context.filesystem.write(
          ".engrenage/github.json",
          JSON.stringify(snapshot),
        );
      }),
    };
  },
);

async function createProject(
  drafts: Record<string, string>,
  { withSnapshot = true }: { withSnapshot?: boolean } = {},
) {
  const project = createTemporaryProject({
    "package.json": JSON.stringify({
      name: "@auaust/app",
      type: "module",
      repository: "github:AUAUST/app",
    }),
    ...(withSnapshot && { ".engrenage/github.json": JSON.stringify(snapshot) }),
    ...drafts,
  });

  return loadConfig(project.root);
}

describe("splitBodySections", () => {
  test("keeps a fenced heading line verbatim in its section", () => {
    expect(
      splitBodySections("## Context\n\n```md\n## Steps\n```\n## Tests"),
    ).toEqual([
      {
        name: undefined,
        lines: [""],
      },
      {
        name: "Context",
        lines: ["## Context", "", "```md", "## Steps", "```"],
      },
      {
        name: "Tests",
        lines: ["## Tests"],
      },
    ]);
  });
});

describe("createDraft", () => {
  test("fetches the GitHub snapshot when the project has none", async () => {
    vi.mocked(fetchGithubSnapshot).mockClear();

    const config = await createProject({}, { withSnapshot: false });

    expect(await createDraft(config, "plan", {})).toBe(
      ".ai/issues/new-plan-1.draft.md",
    );

    expect(fetchGithubSnapshot).toHaveBeenCalledTimes(1);
  });

  test("reads an existing GitHub snapshot without fetching it", async () => {
    vi.mocked(fetchGithubSnapshot).mockClear();

    const config = await createProject({});

    await createDraft(config, "plan", {});

    expect(fetchGithubSnapshot).not.toHaveBeenCalled();
  });

  test("writes a Task's pinned fields with their options and its skeleton, listed last in the parent plan", async () => {
    const config = await createProject({
      ".ai/issues/new-plan.draft.md": plan,
    });

    const file = await createDraft(config, "task", {
      parent: "new-plan",
    });

    expect(file).toBe(".ai/issues/new-task-1.draft.md");

    const content = await config.context.filesystem.read(file);

    expect(content).toBe(`---
title: ""
type: Task
# Options: Tests, Tooling
labels: []
# Options: Drafting, Open questions
Blockers: []
# Options: Chore, Feature, Improvement
Nature: null
# Options: Trivial, Involved
Complexity: null
subIssues: []
blockedBy: []
---

<sections>: <gist>

## Context

## Prerequisites

## Provides

<!-- Provides only for what a plan's Model contracts or a user-facing surface expect from this issue; delete it otherwise. -->

## Housekeeping

<!-- Housekeeping only on a parent whose own work, once its sub-issues land, is commands, checks or record edits applied without an agent; delete it otherwise. -->

## Done when

## Tests

## Planning

## Questions
`);

    const parent = await readDraft(
      config.context.filesystem,
      ".ai/issues/new-plan.draft.md",
    );

    expect(parent?.manifest.toJS()).toMatchObject({
      subIssues: [
        {
          ref: "#{new-first}",
          gist: "First step",
          sections: [],
        },
        {
          ref: "#{new-task-1}",
          gist: "",
          sections: [],
        },
      ],
    });

    expect(parent?.body).toContain("## Goal");
  });

  test.each([
    [
      "references and a prefixed slug",
      "#{new-plan}",
      "#{new-first}",
      "new-foo",
    ],
    ["slugs without their prefix", "plan", "first", "foo"],
  ])("takes the parent and sibling as %s", async (_, parent, after, slug) => {
    const config = await createProject({
      ".ai/issues/new-plan.draft.md": plan,
    });

    await expect(
      createDraft(config, "task", {
        parent,
        after,
        slug,
      }),
    ).resolves.toBe(".ai/issues/new-foo.draft.md");

    const draft = await readDraft(
      config.context.filesystem,
      ".ai/issues/new-plan.draft.md",
    );

    expect(draft?.manifest.toJS()).toMatchObject({
      subIssues: [{ ref: "#{new-first}" }, { ref: "#{new-foo}" }],
    });
  });

  test("rejects a parent that is neither a reference nor a draft stem", async () => {
    const config = await createProject({
      ".ai/issues/new-plan.draft.md": plan,
    });

    await expect(
      createDraft(config, "task", { parent: "#{bad}" }),
    ).rejects.toThrow("`#{bad}` is neither a reference");
  });

  test("resolves a type by its meaning or its GitHub name, in any case", async () => {
    const config = await createProject({
      "engrenage.config.ts": `export default ${JSON.stringify({
        github: {
          contract: {
            types: { idea: "Suggestion" },
          },
        },
      })};`,
      ".engrenage/github.json": JSON.stringify({
        ...snapshot,
        organizations: {
          AUAUST: {
            ...snapshot.organizations.AUAUST,
            types: snapshot.organizations.AUAUST.types.map((candidate) => {
              return candidate.name === "Idea"
                ? type("Suggestion", ["Blockers"])
                : candidate;
            }),
          },
        },
      }),
    });

    await expect(createDraft(config, "Resource", {})).resolves.toBe(
      ".ai/issues/new-resource-1.draft.md",
    );

    await expect(createDraft(config, "suggestion", {})).resolves.toBe(
      ".ai/issues/new-idea-1.draft.md",
    );

    await expect(createDraft(config, "Feature", {})).rejects.toThrow(
      "idea (Suggestion)",
    );
  });

  test("names the claim command when the parent has no draft", async () => {
    const config = await createProject({});

    await expect(createDraft(config, "task", { parent: "12" })).rejects.toThrow(
      "engrenage planning issue claim 12",
    );
  });
});

describe("checkIssues", () => {
  test("reports the quoting hint for an unquoted reference in a block list", async () => {
    const config = await createProject({
      ".ai/issues/new-x.draft.md": first.replace(
        "type: Task",
        "type: Task\nblockedBy:\n  - #{new-foo}",
      ),
    });

    const { lines } = await checkIssues(config, ["new-x"], "worker");

    expect(lines).toContainEqual(
      expect.stringContaining("YAML reads an unquoted `#` as a comment"),
    );
  });

  test("reports the quoting hint for an unquoted reference in a flow list", async () => {
    const config = await createProject({
      ".ai/issues/new-x.draft.md": first.replace(
        "type: Task",
        "type: Task\nblockedBy: [#{new-foo}]",
      ),
    });

    await expect(checkIssues(config, ["new-x"], "worker")).rejects.toThrow(
      "YAML reads an unquoted `#` as a comment",
    );
  });

  test("reports one line per manifest, contract and reference finding of a draft", async () => {
    const config = await createProject({
      ".ai/issues/new-x.draft.md": first
        .replace("Nature: Feature", "Nature: Bogus\nDefect: Bug")
        .replace("- Done.", "- Done after #{new-missing}."),
    });

    const { lines, passed } = await checkIssues(config, ["new-x"], "worker");

    expect(passed).toBe(false);

    expect(lines).toEqual([
      expect.stringMatching(
        /^new-x: Nature: "Bogus" is not an option of Nature/,
      ),
      expect.stringMatching(
        /^new-x: Defect: "Defect" is not a key of a Task manifest/,
      ),
      expect.stringMatching(
        /^new-x: `#\{new-missing\}` names the draft `new-missing`, outside the drafts it can resolve against/,
      ),
    ]);
  });

  test("reports one finding per missing specializing field, complexity and label of a Task", async () => {
    const config = await createProject({
      ".ai/issues/new-x.draft.md": first
        .replace("labels: [Tooling]", "labels: []")
        .replace("Nature: Feature", "Nature: null")
        .replace("Complexity: Trivial", "Complexity: null"),
    });

    await expect(checkIssues(config, ["new-x"], "worker")).resolves.toEqual({
      lines: [
        "new-x: labels: set at least one label: use Tests, Tooling",
        "new-x: Nature: set Nature: use Chore, Feature, Improvement",
        "new-x: Complexity: set Complexity: use Trivial, Involved",
      ],
      passed: false,
    });
  });

  test("passes a Segment without Complexity", async () => {
    const config = await createProject({
      ".ai/issues/new-s.draft.md": `---
title: Segment
type: Segment
labels: [Tooling]
Complexity: null
---

Goal: the segment
`,
    });

    const { lines } = await checkIssues(config, ["new-s"], "worker");

    expect(lines.filter((line) => line.includes("Complexity"))).toEqual([]);
  });

  test("fails once per empty section of a fresh Task, and passes it filled without Planning and Questions", async () => {
    const config = await createProject({});

    const { filesystem } = config.context;

    const file = await createDraft(config, "task", { slug: "fresh" });

    const empty = await checkIssues(config, ["new-fresh"], "worker");

    expect(empty.passed).toBe(false);

    expect(empty.lines.filter((line) => line.includes("is empty"))).toEqual(
      [
        "Context",
        "Prerequisites",
        "Provides",
        "Housekeeping",
        "Done when",
        "Tests",
        "Planning",
        "Questions",
      ].map((name) => `new-fresh: **${name}** is empty: fill it or remove it.`),
    );

    const content = await filesystem.read(file);

    assert(content !== undefined);

    await filesystem.write(
      file,
      content
        .replace('title: ""', "title: Fresh")
        .replace("labels: []", "labels: [Tests]")
        .replace("Nature: null", "Nature: Chore")
        .replace("Complexity: null", "Complexity: Involved")
        .replace("<sections>: <gist>", "Goal: fresh")
        .replace("## Context\n", "## Context\n\nc\n")
        .replace("## Prerequisites\n", "## Prerequisites\n\n- #12: x.\n")
        .replace(/## Provides\n[^#]*/, "")
        .replace(/## Housekeeping\n[^#]*/, "")
        .replace("## Tests\n", "## Tests\n\n- t → passes\n")
        .replace("## Done when\n", "## Done when\n\nd\n")
        .replace("\n## Planning\n\n## Questions\n", ""),
    );

    await expect(checkIssues(config, ["new-fresh"], "worker")).resolves.toEqual(
      { lines: ["new-fresh: ready"], passed: true },
    );
  });

  test("writes a fresh Problem with both Leads and Fix, each under its comment, which check reads as empty", async () => {
    const config = await createProject({});

    const file = await createDraft(config, "problem", { slug: "fresh" });

    const content = await config.context.filesystem.read(file);

    expect(content).toMatch(
      /## Leads\n\n<!-- Leads only when genuine directions[^\n]*-->\n\n## Fix\n\n<!-- Fix exactly when the cause is identified and its fix decided[^\n]*-->\n/,
    );

    const { lines } = await checkIssues(config, ["new-fresh"], "worker");

    expect(lines).toEqual(
      expect.arrayContaining([
        "new-fresh: **Fix** is empty: fill it or remove it.",
        expect.stringMatching(/\*\*Fix\*\*.*\*\*Leads\*\*/),
      ]),
    );
  });

  test("fails an Idea asking questions without a Questions section, and passes it with one", async () => {
    const idea = `---
title: Idea
type: Idea
labels: [Tooling]
Blockers:
  - Open questions
---

## Open

o
`;

    const config = await createProject({
      ".ai/issues/new-idea.draft.md": idea,
    });

    await expect(checkIssues(config, ["new-idea"], "worker")).resolves.toEqual({
      lines: [
        "new-idea: Blockers has `Open questions` although no **Planning** or **Questions** is open: clear the field.",
      ],
      passed: false,
    });

    await config.context.filesystem.write(
      ".ai/issues/new-idea.draft.md",
      `${idea}\n## Questions\n\nq\n`,
    );

    await expect(checkIssues(config, ["new-idea"], "worker")).resolves.toEqual({
      lines: ["new-idea: ready"],
      passed: true,
    });
  });

  test("fails a plan whose body holds its generated Roadmap, and passes a closed set", async () => {
    const config = await createProject({
      ".ai/issues/new-plan.draft.md": plan.replace(
        "## Decisions",
        "## Roadmap\n\n1. #{new-first}\n\n## Decisions",
      ),
      ".ai/issues/new-first.draft.md": first,
    });

    const {
      lines,
      passed,
    } = await checkIssues(config, ["new-plan", "new-first"], "worker");

    expect(passed).toBe(false);

    expect(lines).toEqual([
      expect.stringMatching(/^new-plan: \*\*Roadmap\*\* is generated/),
      "new-first: ready",
    ]);
  });

  test("fails a header starting with a reference, naming the generated chain", async () => {
    const config = await createProject({
      ".ai/issues/new-plan.draft.md": plan,
      ".ai/issues/new-first.draft.md": first.replace(
        "Goal: the first step",
        "#207 › #212 · Goal: the first step",
      ),
    });

    const {
      lines,
    } = await checkIssues(config, ["new-plan", "new-first"], "worker");

    expect(lines).toContain(
      "new-first: The header starts with a reference: `publish` generates the ancestor chain `#<plan> › … › #<parent> · `, so keep only `<sections>: <gist>`.",
    );
  });

  test("resolves references and the parent against every local draft, failing what publish and walk check reject", async () => {
    const config = await createProject({
      ".ai/issues/new-plan.draft.md": plan,
      ".ai/issues/new-first.draft.md": first
        .replace("Goal: the first step", "A plain paragraph\nover two lines.")
        .replace("## Context\n\nc\n", "## Context\n\nc after #{new-plan}.\n")
        .replace("\n## Done when\n\n- Done.\n- Checked.\n", ""),
    });

    await expect(checkIssues(config, ["new-first"], "worker")).resolves.toEqual(
      {
        lines: [
          "new-first: **Done when** is missing: write it.",
          "new-first: The text before the first section spans several lines, but `publish` reads it as the header line: keep only `<sections>: <gist>` there and move the rest into a section.",
          "new-first: warning: A trivial leaf with at most one **Done when** clause and one **Tests** case: merge into a sibling.",
        ],
        passed: false,
      },
    );
  });

  test("checks a draft's Provides against its local plan's Model headings", async () => {
    const withProvides = (heading: string) => {
      return first.replace("## Done when", () => {
        return `## Provides\n\n- ${heading}: the step\n\n## Done when`;
      });
    };

    const model = plan.replace(
      "## Done when",
      "## Storage\n\ns\n\n## Done when",
    );

    const passing = await createProject({
      ".ai/issues/new-plan.draft.md": model,
      ".ai/issues/new-first.draft.md": withProvides("Storage"),
    });

    await expect(
      checkIssues(passing, ["new-first"], "worker"),
    ).resolves.toEqual({ lines: ["new-first: ready"], passed: true });

    const failing = await createProject({
      ".ai/issues/new-plan.draft.md": model,
      ".ai/issues/new-first.draft.md": withProvides("Cache"),
    });

    await expect(
      checkIssues(failing, ["new-first"], "worker"),
    ).resolves.toEqual({
      lines: [
        "new-first: **Provides** names `Cache`, no Model section of the nearest plan: use one of its Model headings: `Storage`.",
      ],
      passed: false,
    });
  });

  test("prints a trivial draft leaf's merge warning without failing", async () => {
    const config = await createProject({
      ".ai/issues/new-x.draft.md": first.replace("- Checked.\n", ""),
    });

    await expect(checkIssues(config, ["new-x"], "worker")).resolves.toEqual({
      lines: [
        "new-x: ready",
        "new-x: warning: A trivial leaf with at most one **Done when** clause and one **Tests** case: merge into a sibling.",
      ],
      passed: true,
    });
  });

  test("requires a plan's generated Roadmap through subIssues, and no Tests", async () => {
    const config = await createProject({
      ".ai/issues/new-plan.draft.md": plan.replace(
        /subIssues:[\s\S]*?sections: \[\]\n/,
        "",
      ),
      ".ai/issues/new-first.draft.md": first.replace(
        "\n## Tests\n\n- t → passes\n",
        "",
      ),
    });

    await expect(checkIssues(config, ["new-plan"], "worker")).resolves.toEqual({
      lines: [
        "new-plan: **Roadmap** is missing: list its issues in `subIssues`, which publish generates it from.",
      ],
      passed: false,
    });

    await expect(checkIssues(config, ["new-first"], "worker")).resolves.toEqual(
      { lines: ["new-first: ready"], passed: true },
    );
  });

  test("reports a cycle through subIssues and blockedBy", async () => {
    const config = await createProject({
      ".ai/issues/new-plan.draft.md": plan,
      ".ai/issues/new-first.draft.md": first.replace(
        "type: Task",
        'type: Task\nblockedBy: ["#{new-plan}"]',
      ),
    });

    const {
      lines,
    } = await checkIssues(config, ["new-plan", "new-first"], "worker");

    expect(lines).toContain(
      "new-plan: Cycle through `subIssues` or `blockedBy`: new-plan → new-first → new-plan.",
    );
  });
});

describe("without a current repository", () => {
  async function createDetachedProject(drafts: Record<string, string>) {
    return createProject({
      "package.json": JSON.stringify({ name: "@auaust/app", type: "module" }),
      "engrenage.config.ts": `export default ${JSON.stringify({
        github: {
          repositories: { toolkit: "AUAUST/toolkit" },
        },
      })};`,
      ".engrenage/github.json": JSON.stringify({
        ...snapshot,
        repositories: {
          toolkit: {
            ...snapshot.repositories.app,
            repository: "AUAUST/toolkit",
          },
        },
      }),
      ...drafts,
    });
  }

  test("creates a draft only in a named repository", async () => {
    const config = await createDetachedProject({});

    await expect(
      createDraft(config, "task", { slug: "x", repo: "toolkit" }),
    ).resolves.toBe(".ai/issues/toolkit.new-x.draft.md");

    await expect(createDraft(config, "task", { slug: "y" })).rejects.toThrow(
      "A draft without --repo needs the current repository: set `repository` in package.json or add an `origin` remote; record the finding as a backlog entry naming its owner instead",
    );
  });

  test("points an unknown repository to the backlog", async () => {
    const config = await createDetachedProject({});

    await expect(
      createDraft(config, "task", { slug: "x", repo: "unknown" }),
    ).rejects.toThrow(
      "Unknown repository short name `unknown`; registered: toolkit; record the finding as a backlog entry naming its owner instead",
    );
  });

  test("checks a prefixed draft and rejects an unprefixed one for the missing current repository", async () => {
    const config = await createDetachedProject({
      ".ai/issues/toolkit.new-x.draft.md": first,
      ".ai/issues/new-y.draft.md": first,
    });

    await expect(
      checkIssues(config, ["toolkit.new-x"], "worker"),
    ).resolves.toEqual({ lines: ["toolkit.new-x: ready"], passed: true });

    await expect(checkIssues(config, ["new-y"], "worker")).rejects.toThrow(
      "new-y needs the current repository",
    );
  });
});

describe("checkIssueViews", () => {
  const context = {
    repository: "o/r",
    registry: new Map([["toolkit", "o/toolkit"]]),
  };

  test("denies a view the local copy holds, in the current or a registered repository", async () => {
    const project = createTemporaryProject({
      ".ai/issues/5.md": "",
      ".ai/issues/toolkit.7.md": "",
    });

    await expect(
      checkIssueViews(
        "gh issue view 5 --json title,body",
        project.root,
        context,
      ),
    ).resolves.toContain(".ai/issues/5.md");

    await expect(
      checkIssueViews("gh issue view 7 -R o/toolkit", project.root, context),
    ).resolves.toContain(".ai/issues/toolkit.7.md");

    await expect(
      checkIssueViews(
        "for n in 4 5; do gh issue view $n --json body; done",
        project.root,
        context,
      ),
    ).resolves.toContain(".ai/issues/5.md");
  });

  test("allows comments, fields the copy lacks and issues without a copy", async () => {
    const project = createTemporaryProject({ ".ai/issues/5.md": "" });

    for (const command of [
      "gh issue view 5 --comments",
      "gh issue view 5 --json body,comments",
      "gh issue view 5 --json assignees",
      "gh issue view 6 --json title",
    ]) {
      await expect(
        checkIssueViews(command, project.root, context),
      ).resolves.toBeUndefined();
    }
  });
});
