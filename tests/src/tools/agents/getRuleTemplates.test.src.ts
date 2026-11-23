import { pathToFileURL } from "node:url";

import { describe, expect, test } from "vitest";

import { loadConfig } from "#project/config/operations/loadConfig";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { createFragmentRenderer } from "#tools/agents/operations/createFragmentRenderer";
import { getRuleTemplates } from "#tools/agents/operations/getRuleTemplates";
import { loadMetalbrainFacts } from "#tools/metalbrain/operations/loadMetalbrainFacts";

async function renderFixtureRule(options: string, directive: string) {
  const project = createTemporaryProject({
    "package.json": '{"type":"module"}',
    "engrenage.config.ts": [
      "export default {",
      `  ${options}`,
      "  extensions: [{",
      '    name: "fixture",',
      '    root: new URL("./rules/", import.meta.url),',
      '    contributes: { "agents.fillers": [{ name: "table", load: () => Promise.resolve((_config, ...args) => `| ${args.join(" | ")} |`) }] },',
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
      "category: fixture",
      "order: 1",
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
    renderer: await createFragmentRenderer(
      config,
      await loadMetalbrainFacts(config),
    ),
    extensions: [
      {
        name: "fixture",
        root: pathToFileURL(`${project.root}/rules/`),
      },
    ],
  });

  return templates.find(({ name }) => name === "filled-rule")?.content;
}

describe("getRuleTemplates", () => {
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
