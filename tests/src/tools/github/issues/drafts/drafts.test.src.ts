import { assert, describe, expect, test, vi } from "vitest";

import { loadConfig } from "#project/config/operations/loadConfig";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { fetchGithubSnapshot } from "#tools/github/issues/api/operations/fetchGithubSnapshot";
import { checkIssues } from "#tools/github/issues/drafts/operations/checkIssues";
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

## Steps

1. Do.

## Tests

- t
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

## Steps

<!-- Steps for the work a worker implements: keep Steps or Housekeeping and delete the other. -->

## Housekeeping

<!-- Housekeeping on a parent whose own work is only commands, checks or record edits, applied without a worker once its sub-issues land. Keep Steps or Housekeeping and delete the other. -->

## Tests

## Done when

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
        .replace("1. Do.", "1. Do after #{new-missing}."),
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
        "Steps",
        "Housekeeping",
        "Tests",
        "Done when",
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
        .replace(/## Steps\n[^#]*/, "## Steps\n\n1. Do.\n\n")
        .replace(/## Housekeeping\n[^#]*/, "")
        .replace("## Tests\n", "## Tests\n\n- t\n")
        .replace("## Done when\n", "## Done when\n\nd\n")
        .replace("\n## Planning\n\n## Questions\n", ""),
    );

    await expect(checkIssues(config, ["new-fresh"], "worker")).resolves.toEqual(
      { lines: ["new-fresh: ready"], passed: true },
    );
  });

  test("writes a fresh Problem with both Steps and Leads, each under its comment, which check reads as empty", async () => {
    const config = await createProject({});

    const file = await createDraft(config, "problem", { slug: "fresh" });

    const content = await config.context.filesystem.read(file);

    expect(content).toMatch(
      /## Steps\n\n<!-- Steps when the cause is clear[^\n]*-->\n\n## Leads\n\n<!-- Leads when the cause still needs investigation[^\n]*-->\n/,
    );

    const { lines } = await checkIssues(config, ["new-fresh"], "debugger");

    expect(lines).toEqual(
      expect.arrayContaining([
        "new-fresh: **Steps** is empty: fill it or remove it.",
        "new-fresh: **Leads** is empty: fill it or remove it.",
        expect.stringMatching(/\*\*Steps\*\* and \*\*Leads\*\*/),
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
        .replace("1. Do.", "1. Do after #{new-plan}.")
        .replace("\n## Tests\n\n- t\n", ""),
    });

    await expect(checkIssues(config, ["new-first"], "worker")).resolves.toEqual(
      {
        lines: [
          "new-first: **Tests** is missing: write it, as **Steps** requires.",
          "new-first: The text before the first section spans several lines, but `publish` reads it as the header line: keep only `<sections>: <gist>` there and move the rest into a section.",
        ],
        passed: false,
      },
    );
  });

  test("requires a plan's generated Roadmap through subIssues, and Tests only for a worker", async () => {
    const config = await createProject({
      ".ai/issues/new-plan.draft.md": plan.replace(
        /subIssues:[\s\S]*?sections: \[\]\n/,
        "",
      ),
      ".ai/issues/new-first.draft.md": first.replace("\n## Tests\n\n- t\n", ""),
    });

    await expect(checkIssues(config, ["new-plan"], "worker")).resolves.toEqual({
      lines: [
        "new-plan: **Roadmap** is missing: list its issues in `subIssues`, which publish generates it from.",
      ],
      passed: false,
    });

    await expect(
      checkIssues(config, ["new-first"], "debugger"),
    ).resolves.toEqual({ lines: ["new-first: ready"], passed: true });
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
