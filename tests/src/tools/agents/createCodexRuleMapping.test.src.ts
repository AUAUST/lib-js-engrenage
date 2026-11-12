import { describe, expect, test } from "vitest";

import { createFilesystem } from "#foundation/filesystem/index";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { createCodexRuleMapping } from "#tools/agents/codex/index";

describe("createCodexRuleMapping", () => {
  test("keeps every matching scope and global rule in the authoritative map", async () => {
    const project = createTemporaryProject({
      ".claude/rules/types.md": '---\npaths: ["src/**", "**/*.ts"]\n---\nTypes',
      ".claude/rules/general.md": "General",
    });

    const filesystem = createFilesystem(project.root);

    const mapping = await createCodexRuleMapping({ filesystem });

    expect(mapping).toContain(
      "All files | <code>.claude/rules/general.md</code>",
    );

    expect(mapping).toContain(
      "<code>src/**</code> | <code>.claude/rules/types.md</code>",
    );

    expect(mapping).toContain(
      "<code>**/*.ts</code> | <code>.claude/rules/types.md</code>",
    );

    expect(mapping).not.toContain("Types");
  });

  test("fails when a referenced rule source is missing", async () => {
    const project = createTemporaryProject({});

    const filesystem = {
      ...createFilesystem(project.root),
      glob: () => Promise.resolve([".claude/rules/missing.md"]),
    };

    await expect(createCodexRuleMapping({ filesystem })).rejects.toThrow(
      "Missing instruction file .claude/rules/missing.md",
    );
  });

  test("fails on malformed rule paths with their source", async () => {
    const project = createTemporaryProject({
      ".claude/rules/broken.md": "---\npaths: [42]\n---\nBroken",
    });

    await expect(
      createCodexRuleMapping({
        filesystem: createFilesystem(project.root),
      }),
    ).rejects.toThrow(".claude/rules/broken.md frontmatter");
  });
});
