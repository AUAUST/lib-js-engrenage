import { describe, expect, test } from "vitest";

import { loadConfig } from "#project/config/operations/loadConfig";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { checkIssues } from "#tools/github/issues/drafts/operations/checkIssues";
import { createDraft } from "#tools/github/issues/drafts/operations/createDraft";
import { readDraft } from "#tools/github/issues/drafts/operations/readDraft";

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
        type("Segment", ["Blockers"]),
        type("Task", ["Blockers", "Nature"]),
        type("Problem", ["Blockers", "Defect"]),
        type("Resource", ["Blockers"]),
        type("Idea", ["Blockers"]),
      ],
      fields: [
        field("Blockers", "multi_select", ["Drafting", "Open questions"]),
        field("Defect", "single_select", ["Bug", "Debt"]),
        field("Nature", "single_select", ["Chore", "Feature", "Improvement"]),
      ],
    },
  },
};

const plan = `---
title: Plan
type: Plan
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
---

## Context

c

## Steps

1. Do.

## Tests

- t
`;

async function createProject(drafts: Record<string, string>) {
  const project = createTemporaryProject({
    "package.json": JSON.stringify({
      name: "@auaust/app",
      type: "module",
      repository: "github:AUAUST/app",
    }),
    ".engrenage/github.json": JSON.stringify(snapshot),
    ...drafts,
  });

  return loadConfig(project.root);
}

describe("createDraft", () => {
  test("writes a Task's pinned fields with their options and its skeleton, listed last in the parent plan", async () => {
    const config = await createProject({
      ".ai/issues/new-plan.draft.md": plan,
    });

    const file = await createDraft(config, "task", { parent: "new-plan" });

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
subIssues: []
blockedBy: []
---

## Context

## Prerequisites

## Steps

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

  test("names the claim command when the parent has no draft", async () => {
    const config = await createProject({});

    await expect(createDraft(config, "task", { parent: "12" })).rejects.toThrow(
      "engrenage planning issue claim 12",
    );
  });
});

describe("checkIssues", () => {
  test("reports one line per manifest, contract and reference finding of a draft", async () => {
    const config = await createProject({
      ".ai/issues/new-x.draft.md": first
        .replace("type: Task", "type: Task\nNature: Bogus\nDefect: Bug")
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
        /^new-x: `#\{new-missing\}` names the draft `new-missing`, outside the checked drafts/,
      ),
    ]);
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
