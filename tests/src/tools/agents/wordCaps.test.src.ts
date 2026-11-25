import { describe, expect, test } from "vitest";

import { findOutputOverrun } from "#metalbrain/runtimes/utils/findOutputOverrun";
import { findWordCapVerdict } from "#metalbrain/runtimes/utils/findWordCapVerdict";
import { loadConfig } from "#project/config/operations/loadConfig";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { measureGithubCommand } from "#tools/metalbrain/operations/measureGithubCommand";

const words = (count: number) => {
  return Array.from({ length: count }, () => "word").join(" ");
};

async function loadWordCaps(root: string) {
  const config = await loadConfig(root);

  const { wordCaps } = await config.resolve("agents");

  return wordCaps;
}

describe("word caps", () => {
  test("defaults follow the writing rules", async () => {
    const project = createTemporaryProject({
      "package.json": '{"type":"module"}',
      "engrenage.config.ts": "export default {};\n",
    });

    expect(await loadWordCaps(project.root)).toEqual({
      mode: "warn",
      compass: 110,
      context: 120,
      doneWhen: 110,
      comment: 150,
      backlogEntry: 100,
      logEntry: 60,
    });
  });

  test("rejects the removed debtEntry word cap, naming the key", async () => {
    const project = createTemporaryProject({
      "package.json": '{"type":"module"}',
      "engrenage.config.ts": "export default { agents: { wordCaps: { debtEntry: 60 } } };\n",
    });

    await expect(loadWordCaps(project.root)).rejects.toThrow("debtEntry");
  });

  test("names wordCaps for the former budgets key", async () => {
    const project = createTemporaryProject({
      "package.json": '{"type":"module"}',
      "engrenage.config.ts": "export default { agents: { budgets: { compass: 60 } } };\n",
    });

    await expect(loadWordCaps(project.root)).rejects.toThrow(
      'renamed "wordCaps"',
    );
  });

  test("measures the prose sections of a gh issue body", async () => {
    const project = createTemporaryProject({
      "package.json": '{"type":"module"}',
      "engrenage.config.ts": "export default {};\n",
    });

    const wordCaps = await loadWordCaps(project.root);

    const task = (context: string) => {
      return `gh issue create --title "tools: x" --body-file - <<'EOF'\n#1 · [Gates](#gates): x\n\n## Context\n\n${context}\n\n## Prerequisites\n\n- ${words(300)}\n\n## Tests\n\n- x\nEOF`;
    };

    expect(measureGithubCommand(task(words(40)), wordCaps)).toEqual([]);

    expect(measureGithubCommand(task(words(200)), wordCaps)).toEqual([
      {
        subject: "gh issue create, Context",
        kind: "context",
        words: 200,
        cap: 120,
      },
    ]);

    expect(
      measureGithubCommand(
        task(`${words(100)} \`${words(30)}\`\n\n\`\`\`\n${words(30)}\n\`\`\``),
        wordCaps,
      ),
    ).toEqual([]);

    expect(
      measureGithubCommand(
        `gh issue comment 3 --body "${words(200)}"`,
        wordCaps,
      ),
    ).toMatchObject([{ kind: "comment", words: 200 }]);

    expect(measureGithubCommand("git status", wordCaps)).toEqual([]);
  });

  test("notices in warn mode and denies in deny mode", () => {
    const findings = [
      {
        subject: "gh issue create, Context",
        kind: "context",
        words: 300,
        cap: 80,
      },
    ] as const;

    expect(findWordCapVerdict(findings, "warn")).toEqual({
      decision: "context",
      context: expect.stringContaining("300 words"),
      notify: true,
    });

    expect(findWordCapVerdict(findings, "deny")).toMatchObject({
      decision: "deny",
    });

    expect(findWordCapVerdict([], "deny")).toBeUndefined();
  });
});

test("findOutputOverrun warns only on an output past the limit", () => {
  expect(findOutputOverrun("x".repeat(10), 10)).toBeUndefined();

  expect(findOutputOverrun("x".repeat(12_000), 10_000)).toContain(
    "printed 12k characters, past the 10k output limit",
  );
});
