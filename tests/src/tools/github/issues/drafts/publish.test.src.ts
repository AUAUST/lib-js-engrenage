import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { isString } from "@auaust/toolkit/isString";
import { max } from "@auaust/toolkit/math";

import { loadConfig } from "#project/config/operations/loadConfig";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { checkIssues } from "#tools/github/issues/drafts/operations/checkIssues";
import { claimIssues } from "#tools/github/issues/drafts/operations/claimIssues";
import { publishIssues } from "#tools/github/issues/drafts/operations/publishIssues";

type MockRepository = "app" | "toolkit";

interface MockIssue {
  repository: MockRepository;
  number: number;
  title: string;
  body: string;
  type: string;
  state: "open" | "closed";
  labels: string[];
  fields: Map<string, string | string[]>;
  subIssues: number[];
  blockedBy: number[];
}

function entity(id: number, name: string) {
  return {
    id,
    nodeId: `N${id}`,
    name,
    description: null,
  };
}

function type(id: number, name: string, pinnedFields: readonly string[]) {
  return {
    ...entity(id, name),
    nodeId: `T-${name}`,
    enabled: true,
    pinnedFields,
  };
}

function option(name: string) {
  return {
    id: 0,
    name,
    description: null,
  };
}

const fieldNames = new Map([
  [21, "Blockers"],
  [22, "Nature"],
]);

const snapshot = {
  repositories: {
    app: {
      repository: "AUAUST/app",
      id: 3,
      nodeId: "R",
      labels: [entity(4, "Tooling")],
    },
    toolkit: {
      repository: "AUAUST/toolkit",
      id: 5,
      nodeId: "R2",
      labels: [entity(6, "Tests")],
    },
  },
  organizations: {
    AUAUST: {
      types: [
        type(1, "Plan", ["Blockers"]),
        type(2, "Segment", ["Blockers"]),
        type(3, "Task", ["Blockers", "Nature"]),
      ],
      fields: [
        {
          ...entity(21, "Blockers"),
          dataType: "multi_select",
          options: [option("Drafting"), option("Delayed")],
        },
        {
          ...entity(22, "Nature"),
          dataType: "single_select",
          options: [option("Feature"), option("Chore")],
        },
      ],
    },
  },
};

const planBody = `## Goal

g

## Roadmap

1. #11: the segment · [Goal](#goal), done
   - #13
2. #12: the task

## Decisions

d`;

const taskBody = `#10 · Goal: the extra

## Context

c

## Steps

1. Do.

## Tests

- t`;

let issues: Map<number, MockIssue>;
let toolkitIssues: Map<number, MockIssue>;
let requests: string[];
let failing: string | undefined;

function createIssue(number: number, values: Partial<MockIssue>): MockIssue {
  return {
    repository: "app",
    number,
    title: `Issue ${number}`,
    body: taskBody,
    type: "Task",
    state: "open",
    labels: [],
    fields: new Map(),
    subIssues: [],
    blockedBy: [],
    ...values,
  };
}

function store(repository: MockRepository) {
  return repository === "app" ? issues : toolkitIssues;
}

function findIssue(number: number, repository: MockRepository = "app") {
  const issue = store(repository).get(number);

  if (issue === undefined) {
    throw new Error(`no mock issue ${repository}#${number}`);
  }

  return issue;
}

function renderIssue(issue: MockIssue) {
  return {
    id: (issue.repository === "app" ? 1000 : 2000) + issue.number,
    node_id: `${issue.repository === "app" ? "I" : "J"}${issue.number}`,
    number: issue.number,
    repository_url: `https://api.github.com/repos/AUAUST/${issue.repository}`,
    title: issue.title,
    body: issue.body,
    state: issue.state,
    state_reason: null,
    type: { name: issue.type },
    labels: issue.labels.map((name) => {
      return { name };
    }),
  };
}

function renderFields(issue: MockIssue) {
  return [...issue.fields].map(([name, value]) => {
    return isString(value)
      ? {
          issue_field_name: name,
          value: 1,
          single_select_option: { name: value },
        }
      : {
          issue_field_name: name,
          value: null,
          multi_select_options: value.map((entry) => {
            return { name: entry };
          }),
        };
  });
}

function respond(data: unknown, status = 200) {
  return new Response(data === undefined ? null : JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json" },
  });
}

function readBody(init: RequestInit): Record<string, unknown> {
  return isString(init.body) ? JSON.parse(init.body) : {};
}

function toNumber(id: unknown) {
  return Number(id) - 1000;
}

function route(method: string, path: string, body: Record<string, unknown>) {
  if (method === "POST" && path === "/graphql") {
    const variables = body.variables as Record<string, string>;

    findIssue(
      Number(variables.issueId?.slice(1)),
      variables.issueId?.startsWith("J") ? "toolkit" : "app",
    ).type = (
      variables.issueTypeId?.slice(2) ?? ""
    );

    return respond({
      data: {},
    });
  }

  const created = /^\/repos\/AUAUST\/(app|toolkit)\/issues$/.exec(path)?.[1];

  if (method === "POST" && created !== undefined) {
    const repository = created as MockRepository;

    const number = max(0, ...store(repository).keys()) + 1;

    const issue = createIssue(number, {
      repository,
      title: String(body.title),
      body: "",
    });

    store(repository).set(number, issue);

    return respond(renderIssue(issue), 201);
  }

  const [
    ,
    repository = "app",
    number = "",
    rest = "",
  ] = /^\/repos\/AUAUST\/(app|toolkit)\/issues\/(\d+)(.*)$/.exec(path) ?? [];

  const issue = findIssue(Number(number), repository as MockRepository);

  switch (`${method} ${rest.replace(/\/\d+$/, "/:id")}`) {
    case "GET ": {
      return respond(renderIssue(issue));
    }

    case "PATCH ": {
      issue.title = String(body.title);
      issue.body = String(body.body);
      issue.labels = (body.labels as string[] | undefined) ?? issue.labels;

      return respond(renderIssue(issue));
    }

    case "GET /issue-field-values": {
      return respond(renderFields(issue));
    }

    case "POST /issue-field-values": {
      for (const { field_id, value } of body.issue_field_values as {
        field_id: number;
        value: string | string[];
      }[]) {
        issue.fields.set(fieldNames.get(field_id) ?? "", value);
      }

      return respond([]);
    }

    case "DELETE /issue-field-values/:id": {
      issue.fields.delete(fieldNames.get(Number(rest.split("/").at(-1))) ?? "");

      return respond(undefined, 204);
    }

    case "GET /sub_issues": {
      return respond(
        issue.subIssues.map((child) => {
          return renderIssue(findIssue(child));
        }),
      );
    }

    case "POST /sub_issues": {
      issue.subIssues.push(toNumber(body.sub_issue_id));

      return respond(renderIssue(issue), 201);
    }

    case "PATCH /sub_issues/priority": {
      const child = toNumber(body.sub_issue_id);

      issue.subIssues = issue.subIssues.filter((entry) => entry !== child);

      const index = body.after_id === undefined
        ? issue.subIssues.indexOf(toNumber(body.before_id))
        : issue.subIssues.indexOf(toNumber(body.after_id)) + 1;

      issue.subIssues.splice(index, 0, child);

      return respond(renderIssue(issue));
    }

    case "GET /parent": {
      const parent = [...issues.values()].find((candidate) => {
        return candidate.subIssues.includes(issue.number);
      });

      return parent === undefined
        ? respond({ message: "Not Found" }, 404)
        : respond(renderIssue(parent));
    }

    case "POST /dependencies/blocked_by": {
      return respond(renderIssue(issue), 201);
    }

    case "GET /dependencies/blocked_by": {
      return respond(
        issue.blockedBy.map((blocker) => {
          return renderIssue(findIssue(blocker));
        }),
      );
    }

    default: {
      throw new Error(`no mock route ${method} ${path}`);
    }
  }
}

beforeEach(() => {
  vi.stubEnv("GH_TOKEN", "t");

  requests = [];
  failing = undefined;

  issues = new Map([
    [
      10,
      createIssue(10, {
        type: "Plan",
        body: planBody,
        subIssues: [11, 12],
      }),
    ],
    [
      11,
      createIssue(11, {
        type: "Segment",
        body: "#10 · Goal: the segment",
        subIssues: [13],
      }),
    ],
    [12, createIssue(12, {})],
    [13, createIssue(13, {})],
  ]);

  toolkitIssues = new Map([
    [
      45,
      createIssue(45, {
        repository: "toolkit",
        body: taskBody.replace("#10 · ", ""),
      }),
    ],
  ]);

  vi.stubGlobal(
    "fetch",
    vi.fn((url: string, init: RequestInit) => {
      const { pathname } = new URL(url);

      const method = init.method ?? "GET";

      const request = `${method} ${pathname}`;

      requests.push(request);

      if (request === failing) {
        return Promise.resolve(respond({ message: "Server Error" }, 500));
      }

      return Promise.resolve(route(method, pathname, readBody(init)));
    }),
  );
});

afterEach(() => {
  vi.unstubAllEnvs();

  vi.unstubAllGlobals();
});

function createProject(files: Record<string, string> = {}) {
  return createTemporaryProject({
    "package.json": JSON.stringify({
      name: "@auaust/app",
      type: "module",
      repository: "github:AUAUST/app",
      dependencies: { "@auaust/toolkit": "1.0.0" },
    }),
    "node_modules/@auaust/toolkit/package.json": JSON.stringify({
      name: "@auaust/toolkit",
      repository: "github:AUAUST/toolkit",
    }),
    ".engrenage/github.json": JSON.stringify(snapshot),
    ...files,
  }).root;
}

function read(root: string, file: string) {
  return readFileSync(join(root, ".ai/issues", file), "utf-8");
}

function listIssueFiles(root: string, files: readonly string[]) {
  return files.filter((file) => existsSync(join(root, ".ai/issues", file)));
}

const extraDraft = `---
title: Extra
type: Task
Nature: Feature
---

${taskBody.replace("#10 · ", "")}
`;

async function claimPlanWithExtra(root: string) {
  const config = await loadConfig(root);

  const { filesystem } = config.context;

  await claimIssues(config, ["10"]);

  const draft = read(root, "10.draft.md");

  await filesystem.write(
    ".ai/issues/10.draft.md",
    draft.replace(
      '  - ref: "#12"',
      '  - ref: "#{new-extra}"\n    gist: the extra\n    sections: []\n  - ref: "#12"',
    ),
  );

  await filesystem.write(".ai/issues/new-extra.draft.md", extraDraft);

  await filesystem.flush();
}

describe("claimIssues and publishIssues", () => {
  test("claims a Plan's roadmap into subIssues and publishes it back unchanged", async () => {
    const root = createProject();

    await claimIssues(await loadConfig(root), ["10"]);

    expect(read(root, "10.md")).toBe(`---
title: Issue 10
type: Plan
labels: []
Blockers: []
subIssues:
  - ref: "#11"
    gist: the segment
    sections:
      - Goal
      - done
  - ref: "#12"
    gist: the task
    sections: []
blockedBy: []
state: open
---

${planBody}
`);

    const draft = read(root, "10.draft.md");

    expect(draft).toContain(`subIssues:
  - ref: "#11"
    gist: the segment
    sections:
      - Goal
      - done
  - ref: "#12"
    gist: the task
    sections: []`);

    expect(draft).not.toContain("## Roadmap");

    expect(findIssue(10).fields.get("Blockers")).toEqual(["Drafting"]);

    const {
      lines,
      passed,
    } = await publishIssues(await loadConfig(root), ["10"]);

    expect({ lines, passed }).toEqual({
      lines: ["#10: published"],
      passed: true,
    });

    expect(findIssue(10).body).toBe(planBody);

    expect(findIssue(10).fields.has("Blockers")).toBe(false);

    expect(listIssueFiles(root, ["10.md", "10.draft.md"])).toEqual([]);
  });

  test("creates a new Task listed in a claimed Plan at its position and deletes all four files", async () => {
    const root = createProject();

    await claimPlanWithExtra(root);

    const {
      passed,
    } = await publishIssues(await loadConfig(root), ["10", "new-extra"]);

    expect(passed).toBe(true);

    expect(findIssue(10).subIssues).toEqual([11, 14, 12]);

    expect(findIssue(10).body).toContain("2. #14: the extra\n3. #12: the task");

    expect(findIssue(14)).toMatchObject({
      title: "Extra",
      type: "Task",
      body: taskBody,
      fields: new Map([["Nature", "Feature"]]),
    });

    expect(
      listIssueFiles(root, [
        "10.md",
        "10.draft.md",
        "14.md",
        "14.draft.md",
        "new-extra.draft.md",
      ]),
    ).toEqual([]);
  });

  test("stops naming the issue and the key changed both in the draft and on GitHub", async () => {
    const root = createProject();

    const config = await loadConfig(root);

    await claimIssues(config, ["10"]);

    await config.context.filesystem.write(
      ".ai/issues/10.draft.md",
      read(root, "10.draft.md").replace("title: Issue 10", "title: Local"),
    );

    await config.context.filesystem.flush();

    findIssue(10).title = "Remote";

    requests = [];

    const { lines, passed } = await publishIssues(config, ["10"]);

    expect(passed).toBe(false);

    expect(lines).toEqual([
      expect.stringMatching(
        /^10: `title` changed both in the draft and on GitHub since the claim/,
      ),
    ]);

    expect(
      requests.filter((request) => {
        return !request.startsWith("GET");
      }),
    ).toEqual([]);
  });

  test("fails a set changing a Segment's subIssues without its Plan before any request", async () => {
    const root = createProject({
      ".ai/issues/new-group.draft.md": `---
title: Group
type: Segment
subIssues: ["#13"]
---

Goal: the group
`,
    });

    const {
      lines,
      passed,
    } = await publishIssues(await loadConfig(root), ["new-group"]);

    expect(passed).toBe(false);

    expect(lines).toEqual([
      expect.stringMatching(
        /^new-group: changes the Segment's `subIssues` while its parent Plan is outside the set/,
      ),
    ]);

    expect(requests).toEqual([]);
  });

  test("leaves a created issue as a claim when a request fails, and a second publish completes the set", async () => {
    const root = createProject();

    await claimPlanWithExtra(root);

    failing = "PATCH /repos/AUAUST/app/issues/14";

    await expect(
      publishIssues(await loadConfig(root), ["10", "new-extra"]),
    ).rejects.toThrow("500");

    expect(
      listIssueFiles(root, ["14.md", "14.draft.md", "new-extra.draft.md"]),
    ).toEqual(["14.md", "14.draft.md"]);

    expect(read(root, "10.draft.md")).toContain('ref: "#14"');

    failing = undefined;

    const {
      passed,
    } = await publishIssues(await loadConfig(root), ["10", "14"]);

    expect(passed).toBe(true);

    expect(findIssue(10).subIssues).toEqual([11, 14, 12]);

    expect(findIssue(14).fields.has("Blockers")).toBe(false);

    expect(
      listIssueFiles(root, ["10.md", "10.draft.md", "14.md", "14.draft.md"]),
    ).toEqual([]);
  });

  test("claims a Task without its chain and publishes the same header back", async () => {
    const published = taskBody.replace(
      "#10 · Goal: the extra",
      "#10 › #11 · Pipeline: gist",
    );

    findIssue(13).body = published;

    const root = createProject();

    await claimIssues(await loadConfig(root), ["13"]);

    expect(read(root, "13.draft.md")).toContain(
      "---\n\nPipeline: gist\n\n## Context",
    );

    const { passed } = await publishIssues(await loadConfig(root), ["13"]);

    expect(passed).toBe(true);

    expect(findIssue(13).body).toBe(published);
  });

  test("renders the chain of a new Task listed in a new Segment under a claimed Plan", async () => {
    const root = createProject();

    const config = await loadConfig(root);

    await claimIssues(config, ["10"]);

    await config.context.filesystem.write(
      ".ai/issues/10.draft.md",
      read(root, "10.draft.md").replace(
        '  - ref: "#12"',
        '  - ref: "#{new-group}"\n    gist: the group\n    sections: []\n  - ref: "#12"',
      ),
    );

    await config.context.filesystem.write(
      ".ai/issues/new-group.draft.md",
      `---\ntitle: Group\ntype: Segment\nsubIssues: ["#{new-step}"]\n---\n\nGoal: the group\n`,
    );

    await config.context.filesystem.write(
      ".ai/issues/new-step.draft.md",
      `---\ntitle: Step\ntype: Task\nNature: Feature\n---\n\n${taskBody.replace("#10 · Goal: the extra", "Goal: the step")}\n`,
    );

    await config.context.filesystem.flush();

    const { lines, passed } = await publishIssues(await loadConfig(root), [
      "10",
      "new-group",
      "new-step",
    ]);

    expect({ lines, passed }).toMatchObject({ passed: true });

    const group = [...issues.values()].find(({ title }) => title === "Group");
    const step = [...issues.values()].find(({ title }) => title === "Step");

    expect(group?.body).toBe("#10 · Goal: the group");

    expect(step?.body.split("\n")[0]).toBe(
      `#10 › #${group?.number} · Goal: the step`,
    );
  });

  test("fails moving a Segment to another Plan without its members' drafts before any request", async () => {
    const root = createProject();

    const config = await loadConfig(root);

    await claimIssues(config, ["10", "11"]);

    await config.context.filesystem.write(
      ".ai/issues/10.draft.md",
      read(root, "10.draft.md").replace(
        '  - ref: "#11"\n    gist: the segment\n    sections:\n      - Goal\n      - done\n',
        "",
      ),
    );

    await config.context.filesystem.write(
      ".ai/issues/new-other.draft.md",
      `---\ntitle: Other\ntype: Plan\nsubIssues:\n  - ref: "#11"\n    gist: the segment\n    sections: []\n---\n\n## Goal\n\ng\n\n## Decisions\n\nd\n`,
    );

    await config.context.filesystem.flush();

    requests = [];

    const {
      lines,
      passed,
    } = await publishIssues(await loadConfig(root), ["10", "11", "new-other"]);

    expect(passed).toBe(false);

    expect(lines).toEqual([
      expect.stringMatching(
        /^11: changes the ancestors of #13 outside the set: claim them/,
      ),
    ]);

    expect(requests.filter((request) => !request.startsWith("GET"))).toEqual(
      [],
    );
  });
});

describe("registered repositories", () => {
  test("renders references relative to each draft's target repository", async () => {
    const root = createProject({
      ".ai/issues/toolkit.new-port.draft.md": `---
title: Port
type: Task
Nature: Feature
---

## Context

Follows #12 and #{toolkit.45}.

## Steps

1. Do.

## Tests

- t
`,
      ".ai/issues/new-local.draft.md": `---
title: Local
type: Task
Nature: Feature
blockedBy: ["#{toolkit.new-port}"]
---

## Context

Follows #{app.7}.

## Steps

1. Do.

## Tests

- t
`,
    });

    const { lines, passed } = await publishIssues(await loadConfig(root), [
      "toolkit.new-port",
      "new-local",
    ]);

    expect({ lines, passed }).toMatchObject({ passed: true });

    expect(findIssue(46, "toolkit").body).toContain(
      "Follows AUAUST/app#12 and #45.",
    );

    expect(findIssue(14).body).toContain("Follows #7.");

    expect(requests).toContain(
      "POST /repos/AUAUST/app/issues/14/dependencies/blocked_by",
    );
  });

  test("refuses claiming another repository's issue and lists the registered names for an unknown one", async () => {
    const root = createProject({
      ".ai/issues/new-lost.draft.md": `---
title: Lost
type: Task
Nature: Feature
---

## Context

See #{unknown.1}.

## Steps

1. Do.

## Tests

- t
`,
    });

    await expect(
      claimIssues(await loadConfig(root), ["toolkit.45"]),
    ).rejects.toThrow("stays with that repository's sessions");

    const {
      lines,
      passed,
    } = await checkIssues(await loadConfig(root), ["new-lost"], "worker");

    expect(passed).toBe(false);

    expect(lines).toContainEqual(
      expect.stringContaining("registered: app, toolkit"),
    );
  });

  test("checks a published issue of a registered repository", async () => {
    const root = createProject();

    await checkIssues(await loadConfig(root), ["toolkit.45"], "worker");

    expect(requests).toContain("GET /repos/AUAUST/toolkit/issues/45");
  });
});
