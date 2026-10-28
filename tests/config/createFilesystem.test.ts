import { existsSync } from "node:fs";

import { describe, expect, test } from "vitest";

import { createFilesystem } from "#config/utils/createFilesystem";
import { createTemporaryProject } from "#tests/helpers/createTemporaryProject";

describe("createFilesystem", () => {
  test("serves reads and globs from memory and writes everything on flush", () => {
    const project = createTemporaryProject({
      "existing.txt": "old\n",
      "unchanged.txt": "same\n",
    });

    const filesystem = createFilesystem(project.root);

    filesystem.write("existing.txt", "new\n");
    filesystem.write(project.resolve("nested/created.txt"), "created\n");
    filesystem.write("unchanged.txt", "same\n");

    expect(filesystem.read("nested/created.txt")).toBe("created\n");

    expect(filesystem.glob("**/*.txt")).toEqual([
      "existing.txt",
      "nested/created.txt",
      "unchanged.txt",
    ]);

    expect(existsSync(project.resolve("nested/created.txt"))).toBe(false);

    expect(filesystem.flush()).toEqual([
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
    expect(filesystem.changes()).toEqual([]);
  });

  test("restores every written file when a write fails, and discards pending writes", () => {
    const project = createTemporaryProject({
      "existing.txt": "old\n",
      "blocker": "a file, not a directory\n",
    });

    const filesystem = createFilesystem(project.root);

    filesystem.write("existing.txt", "new\n");
    filesystem.write("created.txt", "created\n");
    filesystem.write("blocker/unwritable.txt", "never written\n");

    expect(() => filesystem.flush()).toThrow();
    expect(project.read("existing.txt")).toBe("old\n");
    expect(existsSync(project.resolve("created.txt"))).toBe(false);

    expect(filesystem.discard()).toHaveLength(3);
    expect(filesystem.read("existing.txt")).toBe("old\n");
    expect(filesystem.exists("created.txt")).toBe(false);
  });
});

test("stages deletions, hides them from globs and restores them if flush fails", () => {
  const project = createTemporaryProject({
    "existing.txt": "Keep me.\n",
    "blocker": "not a directory",
  });

  const filesystem = createFilesystem(project.root);

  filesystem.remove("existing.txt");
  filesystem.remove("absent.txt");
  filesystem.write("transient.txt", "temporary");
  filesystem.remove("transient.txt");

  expect(filesystem.exists("existing.txt")).toBe(false);
  expect(filesystem.glob("*.txt")).toEqual([]);

  expect(filesystem.changes()).toEqual([
    { file: "existing.txt", status: "deleted" },
  ]);

  expect(project.read("existing.txt")).toBe("Keep me.\n");

  filesystem.write("blocker/unwritable.txt", "fail");

  expect(() => filesystem.flush()).toThrow();
  expect(project.read("existing.txt")).toBe("Keep me.\n");

  filesystem.discard();

  expect(filesystem.exists("existing.txt")).toBe(true);

  filesystem.remove("existing.txt");

  expect(filesystem.flush()).toEqual([
    { file: "existing.txt", status: "deleted" },
  ]);

  expect(existsSync(project.resolve("existing.txt"))).toBe(false);
});
