import { describe, expect, test } from "vitest";

import { loadConfig } from "#project/config/operations/loadConfig";
import { runSync } from "#project/sync/index";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { createTestReporter } from "#tests/utils/createTestReporter";

const budgetsFile = ".engrenage/word-budgets.json";

async function check(files: Record<string, string>) {
  const project = createTemporaryProject({
    "package.json": JSON.stringify({ name: "project", type: "module" }),
    "engrenage.config.ts": `export default { agents: { preferred: ["claude"] } };`,
    "src/index.ts": "",
    "AGENTS.md": "one two three\n",
    ".claude/rules/always.md": "four five\n",
    ".claude/rules/scoped.md": "---\npaths:\n  - src/**\n---\n\nnot loaded at start\n",
    ".claude/agents/worker.md": "---\nname: worker\n---\n\nsix seven\n",
    ...files,
  });

  const loaded = await loadConfig(project.root, {
    reporter: createTestReporter(),
  });

  const [failure] = await runSync(loaded, { names: ["word-budgets"] });

  const budgets: unknown = JSON.parse(
    (await loaded.context.filesystem.read(budgetsFile)) ?? "",
  );

  return { failure, budgets };
}

describe("checkWordBudgets", () => {
  test("lowers a budget its role went under, counting only rules without paths", async () => {
    const { failure, budgets } = await check({
      [budgetsFile]: JSON.stringify({ "agent:worker": 9, "main": 6 }),
    });

    expect(failure).toBeUndefined();

    expect(budgets).toEqual({ "agent:worker": 7, "main": 5 });
  });

  test("fails on a role over its budget, keeping the budget", async () => {
    const { failure, budgets } = await check({
      [budgetsFile]: JSON.stringify({ "agent:worker": 6, "main": 5 }),
    });

    expect(String(failure?.error)).toContain(
      "agent:worker: 7 words, 1 over its budget of 6",
    );

    expect(budgets).toEqual({ "agent:worker": 6, "main": 5 });
  });
});
