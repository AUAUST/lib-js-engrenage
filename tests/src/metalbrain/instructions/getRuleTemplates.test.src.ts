import { describe, expect, test } from "vitest";

import { getRuleTemplates } from "#metalbrain/instructions/operations/getRuleTemplates";
import { loadConfig } from "#project/config/operations/loadConfig";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { loadFragmentRenderer } from "#tools/metalbrain/operations/loadFragmentRenderer";
import { loadInstructionRegistry } from "#tools/metalbrain/operations/loadInstructionRegistry";

async function renderFixtureRule(options: string, directive: string) {
  const project = createTemporaryProject({
    "package.json": '{"type":"module"}',
    "engrenage.config.ts": [
      "export default {",
      `  ${options}`,
      "  extensions: [{",
      '    name: "fixture",',
      '    root: new URL("./rules/", import.meta.url),',
      "    contributes: {",
      '      "agents.instructions": [{ kind: "rule", name: "filled-rule", category: "fixture", paths: ["fixture/**"] }],',
      '      "agents.fillers": [{ name: "table", load: () => Promise.resolve((_config, ...args) => `| ${args.join(" | ")} |`) }],',
      "    },",
      "  }],",
      "};",
    ].join("\n"),
    "rules/package.json": JSON.stringify({
      name: "@fixtures/filled-rules",
      exports: { "./metalbrain/rules/*.md": "./metalbrain/rules/*.md" },
    }),
    "rules/metalbrain/rules/filled-rule.md": [
      "---",
      "title: Filled rule",
      "description: A rule holding a filler directive.",
      "---",
      "",
      "# Filled rule",
      "",
      `<!-- ${directive} -->`,
      "<!-- @end -->",
      "",
    ].join("\n"),
  });

  const config = await loadConfig(project.root);

  const templates = await getRuleTemplates({
    renderer: await loadFragmentRenderer(config),
    instructions: await loadInstructionRegistry(config),
  });

  return templates.find(({ name }) => name === "filled-rule")?.content;
}

describe("getRuleTemplates", () => {
  test("writes the paths an extension registers its rule with to the rule file's frontmatter", async () => {
    const content = await renderFixtureRule("", "@table a b");

    expect(content).toMatch(/^---\npaths:\n {2}- fixture\/\*\*\n---\n/u);
  });

  test("renders filler directives into the rule file it creates", async () => {
    const content = await renderFixtureRule("", "@table a b");

    expect(content).toContain("# Filled rule\n\n| a | b |\n");
    expect(content).not.toContain("@table");
  });

  test("states the configured word caps in the rule a sync renders", async () => {
    const content = await renderFixtureRule(
      "agents: { wordCaps: { goal: 80 } },",
      "@word-caps goal context doneWhen",
    );

    expect(content).toContain(
      [
        "| Text | Word cap |",
        "| --- | --- |",
        "| Issue **Goal** | 80 |",
        "| Issue **Context** | 150 |",
        "| Issue **Done when** | 150 |",
      ].join("\n"),
    );
  });
});
