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

  test("rejects a glob using braces", async () => {
    const project = createTemporaryProject({
      "engrenage.config.ts": 'export default { src: { generated: "types/{a,b}.ts" } };\n',
      "package.json": '{ "type": "module" }',
      ".gitattributes": "# @attributes\n# @end\n",
    });

    const config = await loadConfig(project.root);

    await expect(async () => {
      await runSync(config, { names: ["blocks"] });
    }).rejects.toThrow(
      ".gitattributes: line 1: src/types/{a,b}.ts: .gitattributes patterns cannot negate or use braces",
    );
  });
});
