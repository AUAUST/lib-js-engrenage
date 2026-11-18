import { describe, expect, test } from "vitest";

import { loadConfig } from "#project/config/operations/loadConfig";
import { runSync } from "#project/sync/index";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";

describe("attributes directive", () => {
  test("fills the block from resource flags and keeps the lines after it", async () => {
    const project = createTemporaryProject({
      "engrenage.config.ts": 'export default { agents: { preferred: ["claude"] } };\n',
      "package.json": '{ "type": "module" }',
      ".gitattributes": [
        "# @attributes",
        "stale merge=union",
        "# @end",
        "",
        "*.png binary",
        "",
      ].join("\n"),
    });

    const config = await loadConfig(project.root);

    await runSync(config, { names: ["blocks"] });

    await config.context.filesystem.flush();

    const content = project.read(".gitattributes");

    const lines = content.split("\n");

    expect(lines).toContain("/pnpm-lock.yaml linguist-generated -diff");
    expect(lines).toContain("/.ai/friction.md merge=union");
    expect(lines).toContain("/.ai/discarded.md merge=union");
    expect(lines).not.toContain("stale merge=union");

    expect(content.endsWith("# @end\n\n*.png binary\n")).toBe(true);
  });

  test("expands a brace glob into one line per alternative", async () => {
    const project = createTemporaryProject({
      "engrenage.config.ts": 'export default { src: { generated: "types/{a,b{c,d}}.ts" } };\n',
      "package.json": '{ "type": "module" }',
      ".gitattributes": "# @attributes\n# @end\n",
    });

    const config = await loadConfig(project.root);

    await runSync(config, { names: ["blocks"] });

    await config.context.filesystem.flush();

    const lines = project.read(".gitattributes").split("\n");

    expect(lines).toContain("/src/types/a.ts linguist-generated");
    expect(lines).toContain("/src/types/bc.ts linguist-generated");
    expect(lines).toContain("/src/types/bd.ts linguist-generated");
    expect(lines.some((line) => line.includes("{"))).toBe(false);
  });
});
