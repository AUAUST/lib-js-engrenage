import { existsSync } from "node:fs";

import { afterEach, describe, expect, test } from "vitest";
import { parse } from "yaml";

import { program } from "#nexus/cli/index";
import { runProgram } from "#nexus/cli/operations/runProgram";
import { binaryTimeout } from "#tests/utils/binaryTimeout";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { createTestReporter } from "#tests/utils/createTestReporter";
import { mockCwd } from "#tests/utils/mockCwd";

import metalbrain from "#bin/metalbrain/index";

function createProject() {
  const project = createTemporaryProject({
    "package.json": JSON.stringify({ type: "module", name: "project" }),
    "engrenage.config.ts": 'export default { runtime: { node: 24 }, agents: { preferred: ["claude"] } };',
    "src/index.ts": "",
    ".ai/backlog/tools.yml": "purpose: Tools.\nentries: []\n",
    ".ai/backlog/index.yml": "tools:\n  purpose: Tools.\n  entries: []\n",
  });

  mockCwd(project.root);

  return project;
}

async function run(...args: string[]) {
  const reporter = createTestReporter();

  await runProgram(
    program({ root: metalbrain, scenarios: reporter.scenarios }),
    ["node", "metalbrain", ...args],
  );

  return reporter.messages.map(({ text }) => text).join("\n");
}

const friction = [
  "friction",
  "add",
  "--subject",
  "git add",
  "--tried",
  "ran it",
  "--stopped",
  "reran",
];

afterEach(() => {
  process.exitCode = undefined;
});

describe("metalbrain chains", { timeout: binaryTimeout }, () => {
  test("lands the entry of each invocation", async () => {
    const project = createProject();

    await run("backlog", "add", "tools", "A claim", "--next", ...friction);

    expect(parse(project.read(".ai/backlog/tools.yml")).entries).toMatchObject([
      { title: "A claim" },
    ]);

    expect(parse(project.read(".ai/friction.yml")).entries).toMatchObject([
      { subject: "git add" },
    ]);

    expect(process.exitCode).toBeUndefined();
  });

  test("runs nothing on a usage error in a later invocation, naming it", async () => {
    const project = createProject();

    const printed = await run(
      "backlog",
      "add",
      "tools",
      "A claim",
      "--next",
      ...friction,
      "--next",
      "backlog",
      "add",
      "tools",
    );

    expect(printed).toContain("invocation 3: missing required argument");
    expect(existsSync(project.resolve(".ai/friction.yml"))).toBe(false);
    expect(project.read(".ai/backlog/tools.yml")).toContain("entries: []");
  });

  test("keeps the effects of invocations before one failing, running none after it", async () => {
    const project = createProject();

    const printed = await run(
      "backlog",
      "add",
      "tools",
      "A claim",
      "--next",
      "backlog",
      "add",
      "unknown",
      "Another claim",
      "--next",
      ...friction,
    );

    expect(printed).toContain("invocation 2 failed; invocation 3 did not run");

    expect(parse(project.read(".ai/backlog/tools.yml")).entries).toMatchObject([
      { title: "A claim" },
    ]);

    expect(existsSync(project.resolve(".ai/friction.yml"))).toBe(false);
    expect(process.exitCode).toBe(1);
  });

  test("never chains a hook", async () => {
    createProject();

    const printed = await run(
      "hook",
      "claude",
      "PreToolUse",
      "--next",
      "backlog",
      "list",
    );

    expect(printed).toContain(
      "invocation 1: command 'metalbrain hook claude PreToolUse' cannot be chained",
    );
  });
});
