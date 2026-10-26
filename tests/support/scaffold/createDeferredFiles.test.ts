import { existsSync } from "node:fs";

import { describe, expect, test } from "vitest";

import { createDeferredFiles } from "#support/scaffold/utils/createDeferredFiles";
import { createTemporaryProject } from "#tests/helpers/createTemporaryProject";

describe("createDeferredFiles", () => {
  test("reads pending content and writes everything on commit", () => {
    const project = createTemporaryProject({
      "existing.txt": "old\n",
    });

    const files = createDeferredFiles(project.root);

    files.write("existing.txt", "new\n");
    files.write("nested/created.txt", "created\n");

    expect(files.read("nested/created.txt")).toBe("created\n");
    expect(existsSync(project.resolve("nested/created.txt"))).toBe(false);

    expect(files.commit()).toEqual([
      {
        file: "existing.txt",
        status: "synced",
      },
      {
        file: "nested/created.txt",
        status: "created",
      },
    ]);
    expect(project.read("existing.txt")).toBe("new\n");
    expect(project.read("nested/created.txt")).toBe("created\n");
  });

  test("restores every written file when a write fails", () => {
    const project = createTemporaryProject({
      "existing.txt": "old\n",
      "blocker": "a file, not a directory\n",
    });

    const files = createDeferredFiles(project.root);

    files.write("existing.txt", "new\n");
    files.write("created.txt", "created\n");
    files.write("blocker/unwritable.txt", "never written\n");

    expect(() => files.commit()).toThrow();
    expect(project.read("existing.txt")).toBe("old\n");
    expect(existsSync(project.resolve("created.txt"))).toBe(false);
  });
});
