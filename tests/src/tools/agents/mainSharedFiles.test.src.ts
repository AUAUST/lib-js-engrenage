import { describe, expect, test } from "vitest";

import { loadConfig } from "#project/config/operations/loadConfig";
import { runSync } from "#project/sync/index";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { createTestReporter } from "#tests/utils/createTestReporter";
import { linkSourcePackage } from "#tests/utils/linkSourcePackage";

const metalbrain = "@auaust/engrenage/metalbrain";

const requestAnalysis = ".claude/shared/request-analysis.md";

const analysisSkill = ".claude/skills/analysis/SKILL.md";

async function sync(files: Record<string, string> = {}) {
  const project = createTemporaryProject({
    "package.json": '{"type":"module","repository":"github:acme/consumer"}',
    "engrenage.config.ts": 'export default { agents: { preferred: ["claude"] } };',
    "src/index.ts": "",
    "AGENTS.md": `# AGENTS.md\n\n<!-- @reference ${metalbrain}/sections/analysis.md -->\n<!-- @end -->\n`,
    ...files,
  });

  linkSourcePackage(project.resolve("node_modules/@auaust/engrenage"));

  const loaded = await loadConfig(project.root, {
    reporter: createTestReporter(),
  });

  const failures = await runSync(loaded, {
    names: ["agents", "blocks", "fragment-files"],
  });

  expect(failures).toEqual([]);

  return loaded.context.filesystem;
}

describe("main session shared files", () => {
  test("installs request analysis beside the analysis skill's own copy, both named in AGENTS.md", async () => {
    const filesystem = await sync({
      [analysisSkill]: `<!-- @reference ${metalbrain}/skills/analysis.md -->\n<!-- @end -->\n`,
      ".claude/rules/issues.md": "",
    });

    expect(await filesystem.read(requestAnalysis)).toContain(
      `<!-- @reference ${metalbrain}/shared/request-analysis.md -->\n\n# Request analysis`,
    );

    expect(
      await filesystem.exists(".claude/skills/analysis/request-analysis.md"),
    ).toBe(true);

    const agents = await filesystem.read("AGENTS.md");

    expect(agents).toContain(`follow \`${requestAnalysis}\``);

    expect(agents).toContain("`.claude/skills/analysis/analysis.md`");
  });

  test("installs request analysis and names it in AGENTS.md without the analysis skill", async () => {
    const filesystem = await sync();

    expect(await filesystem.exists(analysisSkill)).toBe(false);

    expect(await filesystem.read(requestAnalysis)).toContain(
      "# Request analysis",
    );

    const agents = await filesystem.read("AGENTS.md");

    expect(agents).toContain(`follow \`${requestAnalysis}\``);

    expect(agents).not.toContain(".claude/skills/analysis/");
  });
});
