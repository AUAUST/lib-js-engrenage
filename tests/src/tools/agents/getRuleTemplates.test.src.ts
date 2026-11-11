import { pathToFileURL } from "node:url";

import { describe, expect, test } from "vitest";

import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { getRuleTemplates } from "#tools/agents/operations/getRuleTemplates";

describe("getRuleTemplates", () => {
  test("renders filler directives into the rule file it creates", async () => {
    const project = createTemporaryProject({
      "package.json": JSON.stringify({
        name: "@fixtures/filled-rules",
        exports: { "./agents/rules/*.md": "./agents/rules/*.md" },
      }),
      "agents/rules/filled-rule.md": [
        "---",
        "title: Filled rule",
        "description: A rule holding a filler directive.",
        "category: fixture",
        "order: 1",
        "---",
        "",
        "# Filled rule",
        "",
        "<!-- @table a b -->",
        "<!-- @end -->",
        "",
      ].join("\n"),
    });

    const templates = await getRuleTemplates({
      fillers: { table: (...args) => `| ${args.join(" | ")} |` },
      extensions: [
        { name: "fixture", root: pathToFileURL(`${project.root}/`) },
      ],
    });

    const rule = templates.find(({ name }) => name === "filled-rule");

    expect(rule?.content).toContain("# Filled rule\n\n| a | b |\n");
    expect(rule?.content).not.toContain("@table");
  });
});
