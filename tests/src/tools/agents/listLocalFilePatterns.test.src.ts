import { describe, expect, test } from "vitest";

import { loadConfig } from "#project/config/operations/loadConfig";
import { createGitRepository } from "#tests/utils/createGitRepository";
import { listLocalFilePatterns } from "#tools/agents/operations/listLocalFilePatterns";

describe("listLocalFilePatterns", () => {
  test("appends the drafts and handoffs directories to the .gitignore patterns", async () => {
    const { project } = await createGitRepository(
      {
        "package.json": '{"type":"module"}',
        ".gitignore": "node_modules\n",
      },
      [],
    );

    expect(await listLocalFilePatterns(await loadConfig(project.root))).toEqual(
      ["node_modules", ".ai/issues/", ".ai/handoffs/"],
    );
  });
});
