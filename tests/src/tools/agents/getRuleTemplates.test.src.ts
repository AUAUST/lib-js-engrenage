import { pathToFileURL } from "node:url";

import { describe, expect, test } from "vitest";

import { loadConfig } from "#project/config/operations/loadConfig";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { createFragmentRenderer } from "#tools/agents/operations/createFragmentRenderer";
import { getRuleTemplates } from "#tools/agents/operations/getRuleTemplates";

describe("getRuleTemplates", () => {
  test("renders filler directives into the rule file it creates", async () => {
    const project = createTemporaryProject({
      "package.json": '{"type":"module"}',
      "engrenage.config.ts": [
        "export default {",
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
        "<!-- @table a b -->",
        "<!-- @end -->",
        "",
      ].join("\n"),
    });

    const config = await loadConfig(project.root);

    const templates = await getRuleTemplates({
      renderer: await createFragmentRenderer(config),
      extensions: [
        {
          name: "fixture",
          root: pathToFileURL(`${project.root}/rules/`),
        },
      ],
    });

    const rule = templates.find(({ name }) => name === "filled-rule");

    expect(rule?.content).toContain("# Filled rule\n\n| a | b |\n");
    expect(rule?.content).not.toContain("@table");
  });
});
