import { includeIgnoreFile } from "eslint/config";
import { describe, expect, test } from "vitest";

import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { createIgnoreRules } from "#tools/eslint/utils/createIgnoreRules";

describe("createIgnoreRules", () => {
  test("applies excludes files after the gitignore files, relative to the repository root", () => {
    const project = createTemporaryProject({
      ".gitignore": "dist/\n",
      "exclude": "scratch/\n",
    });

    const rules = createIgnoreRules({
      ignoreFiles: [project.resolve(".gitignore")],
      excludeFiles: [project.resolve("exclude")],
      root: project.root,
      ignored: ["dist"],
    });

    expect(rules[1]).toEqual({
      ...includeIgnoreFile([project.resolve("exclude")])[0],
      basePath: project.root,
    });
  });
});
