import { describe, expect, test, vi } from "vitest";

import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { measureEditedFile } from "#tools/agents/operations/measureEditedFile";
import { reportBudgetFindings } from "#tools/agents/operations/reportBudgetFindings";
import { measureGithubCommand } from "#tools/agents/utils/measureGithubCommand";
import { loadConfig } from "#workflows/registry/operations/loadConfig";

const words = (count: number) =>
  Array.from({ length: count }, () => "word").join(" ");

async function loadBudgets(root: string) {
  const config = await loadConfig(root);
  const { budgets } = await config.get("agents");

  return budgets;
}

describe("budgets", () => {
  test("defaults follow the writing rules", async () => {
    const project = createTemporaryProject({
      "package.json": '{"type":"module"}',
      "engrenage.config.ts": "export default {};\n",
    });

    expect(await loadBudgets(project.root)).toEqual({
      mode: "warn",
      plan: 1200,
      block: 60,
      task: 250,
      comment: 150,
      backlogEntry: 60,
      debtEntry: 60,
    });
  });

  test("warns on a backlog entry over budget and not on one within", async () => {
    const project = createTemporaryProject({
      "package.json": '{"type":"module"}',
      "engrenage.config.ts": "export default {};\n",
      ".ai/backlog/tools.md": `# tools\n\n## 1. Short\n\n- why: ${words(5)}\n\n## 2. Long\n\n- why: ${words(80)}\n`,
    });

    const findings = await measureEditedFile(
      project.root,
      project.resolve(".ai/backlog/tools.md"),
      await loadBudgets(project.root),
    );

    expect(findings).toMatchObject([
      {
        subject: "2. Long",
        kind: "backlogEntry",
        budget: 60,
      },
    ]);
  });

  test("ignores files that hold no budgeted entries", async () => {
    const project = createTemporaryProject({
      "package.json": '{"type":"module"}',
      "engrenage.config.ts": "export default {};\n",
      ".ai/backlog/index.md": `## Categories\n\n${words(200)}\n`,
    });

    expect(
      await measureEditedFile(
        project.root,
        project.resolve(".ai/backlog/index.md"),
        await loadBudgets(project.root),
      ),
    ).toEqual([]);
  });

  test("measures the heredoc of a gh command against its issue kind", async () => {
    const project = createTemporaryProject({
      "package.json": '{"type":"module"}',
      "engrenage.config.ts": "export default {};\n",
    });

    const budgets = await loadBudgets(project.root);

    const task = (body: string) => {
      return `gh issue create --title "tools: x" --body-file - <<'EOF'\n${body}\nEOF`;
    };

    expect(measureGithubCommand(task(words(300)), budgets)).toMatchObject({
      kind: "task",
      words: 300,
    });

    expect(measureGithubCommand(task(words(100)), budgets)).toBeUndefined();

    expect(
      measureGithubCommand(
        `gh issue create --title "Plan: x" --body-file - <<'EOF'\n${words(300)}\nEOF`,
        budgets,
      ),
    ).toBeUndefined();

    expect(
      measureGithubCommand(
        `gh issue comment 3 --body "${words(200)}"`,
        budgets,
      ),
    ).toMatchObject({ kind: "comment" });

    expect(measureGithubCommand("git status", budgets)).toBeUndefined();
  });

  test("warns in warn mode and denies in deny mode", () => {
    const write = vi.spyOn(process.stdout, "write").mockReturnValue(true);

    const findings = [
      {
        subject: "gh issue create",
        kind: "task",
        words: 300,
        budget: 250,
      },
    ] as const;

    reportBudgetFindings(findings, { mode: "warn", event: "PreToolUse" });
    reportBudgetFindings(findings, { mode: "deny", event: "PreToolUse" });
    reportBudgetFindings([], { mode: "deny", event: "PreToolUse" });

    const [warn, deny] = write.mock.calls.map(([chunk]) => {
      return JSON.parse(String(chunk)) as Record<string, any>;
    });

    expect(write.mock.calls).toHaveLength(2);

    write.mockRestore();

    expect(warn?.hookSpecificOutput.additionalContext).toContain("300 words");
    expect(warn?.hookSpecificOutput.permissionDecision).toBeUndefined();
    expect(deny?.hookSpecificOutput.permissionDecision).toBe("deny");
  });
});
