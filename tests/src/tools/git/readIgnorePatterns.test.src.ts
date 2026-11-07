import { describe, expect, test } from "vitest";

import { createFilesystem } from "#foundation/filesystem/index";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { readIgnorePatterns } from "#tools/git/operations/readIgnorePatterns";

describe("readIgnorePatterns", () => {
  test("drops comments and blank lines while preserving pattern order", async () => {
    const project = createTemporaryProject({
      ".gitignore": "# env\r\n\r\n.env.*\r\n!.env.example\r\n \r\n/dist\r\n",
    });

    const filesystem = createFilesystem(project.root);

    expect(await readIgnorePatterns(filesystem, ".gitignore")).toEqual([
      ".env.*",
      "!.env.example",
      "/dist",
    ]);

    expect(await readIgnorePatterns(filesystem, "missing")).toEqual([]);
  });
});
