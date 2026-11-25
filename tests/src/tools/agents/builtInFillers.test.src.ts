import { describe, expect, test } from "vitest";

import { loadConfig } from "#project/config/operations/loadConfig";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { loadFragmentRenderer } from "#tools/metalbrain/operations/loadFragmentRenderer";

const planningConfig = 'export default { agents: { preferred: ["claude"] }, github: { planning: true } };';

async function render(root: string, body: string) {
  const config = await loadConfig(root);

  const renderer = await loadFragmentRenderer(config);

  return renderer.render(body, "fixture.md");
}

describe("@word-caps", () => {
  test("fails on a kind no word cap has, listing the known ones", async () => {
    const project = createTemporaryProject({
      "package.json": '{"type":"module"}',
      "engrenage.config.ts": "export default {};",
    });

    await expect(
      render(
        project.root,
        "<!-- @word-caps compass summary -->\n<!-- @end -->\n",
      ),
    ).rejects.toThrow(
      "Unknown word cap kind summary, expected one of: compass,",
    );
  });
});

describe("@agent-limits", () => {
  test("renders the limits of shipped agents although a skill holds its own marker", async () => {
    const project = createTemporaryProject({
      "package.json": '{"type":"module"}',
      "engrenage.config.ts": planningConfig,
    });

    const limits = await render(
      project.root,
      "<!-- @agent-limits -->\n<!-- @end -->\n",
    );

    expect(limits).toContain("| `worker` | medium |");

    expect(limits).toContain("| `consultant` | medium | none | 100k context |");
  });

  test("renders only the named installed agents, in the order given", async () => {
    const project = createTemporaryProject({
      "package.json": '{"type":"module"}',
      "engrenage.config.ts": planningConfig,
    });

    const limits = await render(
      project.root,
      "<!-- @agent-limits merger worker -->\n<!-- @end -->\n",
    );

    const rows = limits.trim().split("\n").slice(2);

    expect(rows).toHaveLength(2);

    expect(rows[0]).toContain("| `merger` |");

    expect(rows[1]).toContain("| `worker` |");
  });

  test("reports no agent when no name matches an installed agent", async () => {
    const project = createTemporaryProject({
      "package.json": '{"type":"module"}',
      "engrenage.config.ts": planningConfig,
    });

    expect(
      await render(
        project.root,
        "<!-- @agent-limits missing -->\n<!-- @end -->\n",
      ),
    ).toContain("No agent skills are installed.");
  });
});
