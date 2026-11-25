import { describe, expect, test } from "vitest";

import { defineLogGroup } from "#bin/metalbrain/logs/index";
import { binaryTimeout } from "#tests/utils/binaryTimeout";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { mockCwd } from "#tests/utils/mockCwd";
import { runCommand } from "#tests/utils/runCommand";

import backlog from "#bin/metalbrain/backlog/index";
import search from "#bin/metalbrain/search";

const cli = "purpose: Commands.\nentries:\n  - id: BL-0c1100\n    title: Output to a closed pipe crashes\n  - id: BL-0c1200\n    title: Program wiring copies internals\n";

const readme = "purpose: Readme.\nentries:\n  - id: BL-4ead00\n    title: The README lacks the CLI reference\n";

const friction = "entries:\n  - id: FR-000001\n    subject: git status listing\n    tried: ran git ls-files on files\n    stopped: slow\n  - id: FR-000002\n    subject: '`git ls-files --others`'\n    tried: listed ignored paths\n    stopped: skipped directories\n  - id: FR-000003\n    subject: git add\n    tried: ran it\n    stopped: reran\n";

function createProject() {
  const project = createTemporaryProject({
    "package.json": JSON.stringify({ type: "module", name: "project" }),
    "engrenage.config.ts": 'export default { runtime: { node: 24 }, agents: { preferred: ["claude"] } };',
    "src/index.ts": "",
    ".ai/backlog/cli.yml": cli,
    ".ai/backlog/readme.yml": readme,
    ".ai/backlog/index.yml": "cli:\n  purpose: Commands.\n  entries: [BL-0c1100, BL-0c1200]\nreadme:\n  purpose: Readme.\n  entries: [BL-4ead00]\n",
    ".ai/friction.yml": friction,
  });

  mockCwd(project.root);

  return project;
}

async function readLines(promise: ReturnType<typeof runCommand>) {
  const { messages } = await promise;

  return messages.map(({ text }) => text);
}

describe("metalbrain search", { timeout: binaryTimeout }, () => {
  test("backlog search cli ranks the cli category's entries first", async () => {
    createProject();

    const lines = await readLines(
      runCommand("backlog", backlog, "search", "cli"),
    );

    expect(lines.slice(0, 2)).toEqual(["backlog:", "├ cli:"]);

    expect(lines.slice(2, 4).toSorted()).toEqual([
      "│ BL-0c1100 Output to a closed pipe crashes",
      "│ BL-0c1200 Program wiring copies internals",
    ]);

    expect(lines.slice(4)).toEqual([
      "└ readme:",
      "  BL-4ead00 The README lacks the CLI reference",
    ]);
  });

  test("friction search of a quoted phrase ranks the entry whose subject quotes it first", async () => {
    createProject();

    const lines = await readLines(
      runCommand(
        "friction",
        defineLogGroup({ taps: true }),
        "search",
        '"git ls-files"',
      ),
    );

    expect(lines).toEqual([
      "friction:",
      "├ FR-000002 `git ls-files --others`: listed ignored paths — skipped directories",
      expect.stringMatching(/^└ FR-/u),
    ]);
  });

  test("paints every kind together as a kind and category tree, and ends a truncated page with its rerun", async () => {
    createProject();

    const lines = await readLines(
      runCommand("search", search, "git", "OR", "cli", "--limit", "5"),
    );

    expect(lines).toEqual([
      "backlog:",
      "├ cli:",
      "│ BL-0c1100 Output to a closed pipe crashes",
      "│ BL-0c1200 Program wiring copies internals",
      "└ readme:",
      "  BL-4ead00 The README lacks the CLI reference",
      "friction:",
      "├ FR-000001 git status listing: ran git ls-files on files — slow",
      "└ FR-000002 `git ls-files --others`: listed ignored paths — skipped directories",
      "1 more: pnpm metalbrain search git OR cli --limit 5 --offset 5",
    ]);
  });

  test("an implicit AND nothing matches ranks entries matching any term, saying so first", async () => {
    createProject();

    const lines = await readLines(
      runCommand(
        "friction",
        defineLogGroup({ taps: true }),
        "search",
        "add",
        "nowhere",
      ),
    );

    expect(lines).toEqual([
      "No entry matches every term; entries matching any of them:",
      "friction:",
      "└ FR-000003 git add: ran it — reran",
    ]);
  });

  test("--text searches raw text as a text query, never parsed", async () => {
    createProject();

    const lines = await readLines(
      runCommand(
        "friction",
        defineLogGroup({ taps: true }),
        "search",
        "--text",
        "listed `git ls-files --others` (OR",
      ),
    );

    expect(lines[1]).toMatch(/^[├└] FR-000002 /u);
  });
});
