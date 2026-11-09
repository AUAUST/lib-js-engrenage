import { describe, expect, test, vi } from "vitest";

import { loadConfig } from "#project/config/operations/loadConfig";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { measureEditedFile } from "#tools/agents/operations/measureEditedFile";
import { reportBudgetFindings } from "#tools/agents/operations/reportBudgetFindings";
import { measureGithubCommand } from "#tools/agents/utils/measureGithubCommand";

const words = (count: number) =>
  Array.from({ length: count }, () => "word").join(" ");

async function loadBudgets(root: string) {
  const config = await loadConfig(root);

  const { budgets } = await config.resolve("agents");

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
      goal: 60,
      context: 80,
      doneWhen: 60,
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

  test("measures the prose sections of a gh issue body", async () => {
    const project = createTemporaryProject({
      "package.json": '{"type":"module"}',
      "engrenage.config.ts": "export default {};\n",
    });

    const budgets = await loadBudgets(project.root);

    const task = (context: string) => {
      return `gh issue create --title "tools: x" --body-file - <<'EOF'\n#1 · [Gates](#gates): x\n\n## Context\n\n${context}\n\n## Steps\n\n1. ${words(300)}\n\n## Tests\n\n- x\nEOF`;
    };

    expect(measureGithubCommand(task(words(40)), budgets)).toEqual([]);

    expect(measureGithubCommand(task(words(120)), budgets)).toEqual([
      {
        subject: "gh issue create, Context",
        kind: "context",
        words: 120,
        budget: 80,
      },
    ]);

    expect(
      measureGithubCommand(
        task(`${words(70)} \`${words(30)}\`\n\n\`\`\`\n${words(30)}\n\`\`\``),
        budgets,
      ),
    ).toEqual([]);

    expect(
      measureGithubCommand(
        `gh issue comment 3 --body "${words(200)}"`,
        budgets,
      ),
    ).toMatchObject([{ kind: "comment", words: 200 }]);

    expect(measureGithubCommand("git status", budgets)).toEqual([]);
  });

  test("warns in warn mode and denies in deny mode", () => {
    const write = vi.spyOn(process.stdout, "write").mockReturnValue(true);

    const findings = [
      {
        subject: "gh issue create, Context",
        kind: "context",
        words: 300,
        budget: 80,
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
