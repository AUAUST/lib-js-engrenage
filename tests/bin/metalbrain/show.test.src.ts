import { describe, expect, test } from "vitest";

import { binaryTimeout } from "#tests/utils/binaryTimeout";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { mockCwd } from "#tests/utils/mockCwd";
import { runCommand } from "#tests/utils/runCommand";

import show from "#bin/metalbrain/show";

function createProject() {
  const project = createTemporaryProject({
    "package.json": JSON.stringify({ type: "module", name: "project" }),
    "engrenage.config.ts": 'export default { runtime: { node: 24 }, agents: { preferred: ["claude"] } };',
    "src/index.ts": "",
    ".ai/backlog/tools.yml": "purpose: Tools.\nentries:\n  - id: BL-3fa9c1\n    title: A claim\n",
    ".ai/backlog/index.yml": "tools:\n  purpose: Tools.\n  entries: [BL-3fa9c1]\n",
    ".ai/friction.yml": "entries:\n  - id: FR-08d2e7\n    subject: git add\n    tried: ran it\n    stopped: reran\n",
    ".ai/renamed-ids.yml": "261122-8ede: BL-3fa9c1\n",
  });

  mockCwd(project.root);

  return project;
}

describe("metalbrain show", { timeout: binaryTimeout }, () => {
  test("prints a renamed entry given its former ID, naming its new ID", async () => {
    createProject();

    const { messages } = await runCommand("show", show, "261122-8ede");

    expect(messages.map(({ text }) => text)).toEqual([
      "261122-8ede is now BL-3fa9c1",
      "backlog:",
      "└ tools:",
      "  BL-3fa9c1 A claim",
    ]);
  });

  test("prints entries of several kinds, each under its kind", async () => {
    createProject();

    const {
      messages,
    } = await runCommand("show", show, "BL-3fa9c1", "FR-08d2e7");

    expect(messages.map(({ text }) => text)).toEqual([
      "backlog:",
      "└ tools:",
      "  BL-3fa9c1 A claim",
      "friction:",
      "└ FR-08d2e7 git add",
      "  tried: ran it",
      "  stopped: reran",
    ]);
  });

  test("splits comma-separated IDs, keeping their order", async () => {
    createProject();

    const {
      messages,
    } = await runCommand("show", show, "FR-08d2e7,", " BL-3fa9c1");

    expect(messages.map(({ text }) => text)).toEqual([
      "friction:",
      "└ FR-08d2e7 git add",
      "  tried: ran it",
      "  stopped: reran",
      "backlog:",
      "└ tools:",
      "  BL-3fa9c1 A claim",
    ]);
  });
});
