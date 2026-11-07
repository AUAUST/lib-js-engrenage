import { existsSync } from "node:fs";

import { describe, expect, test } from "vitest";

import { createFilesystem } from "#foundation/filesystem/operations/createFilesystem";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";

describe("createFilesystem", () => {
  test("serves reads and globs from memory and writes everything on flush", async () => {
    const project = createTemporaryProject({
      "existing.txt": "old\n",
      "unchanged.txt": "same\n",
    });

    const filesystem = createFilesystem(project.root);

    await filesystem.write("existing.txt", "new\n");

    await filesystem.write(project.resolve("nested/created.txt"), "created\n");

    await filesystem.write("unchanged.txt", "same\n");

    expect(await filesystem.read("nested/created.txt")).toBe("created\n");

    expect(await filesystem.glob("**/*.txt")).toEqual([
      "existing.txt",
      "nested/created.txt",
      "unchanged.txt",
    ]);

    expect(existsSync(project.resolve("nested/created.txt"))).toBe(false);

    expect(await filesystem.flush()).toEqual([
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

  test("restores every written file when a write fails, and discards pending writes", async () => {
    const project = createTemporaryProject({
      "existing.txt": "old\n",
      "blocker": "a file, not a directory\n",
    });

    const filesystem = createFilesystem(project.root);

    await filesystem.write("existing.txt", "new\n");

    await filesystem.write("created.txt", "created\n");

    await filesystem.write("blocker/unwritable.txt", "never written\n");

    await expect(filesystem.flush()).rejects.toThrow();

    expect(project.read("existing.txt")).toBe("old\n");
    expect(existsSync(project.resolve("created.txt"))).toBe(false);

    expect(filesystem.discard()).toHaveLength(3);
    expect(await filesystem.read("existing.txt")).toBe("old\n");
    expect(await filesystem.exists("created.txt")).toBe(false);
  });
});

test("stages deletions, hides them from globs and restores them if flush fails", async () => {
  const project = createTemporaryProject({
    "existing.txt": "Keep me.\n",
    "blocker": "not a directory",
  });

  const filesystem = createFilesystem(project.root);

  await filesystem.remove("existing.txt");

  await filesystem.remove("absent.txt");

  await filesystem.write("transient.txt", "temporary");

  await filesystem.remove("transient.txt");

  expect(await filesystem.exists("existing.txt")).toBe(false);
  expect(await filesystem.glob("*.txt")).toEqual([]);

  expect(filesystem.changes()).toEqual([
    { file: "existing.txt", status: "deleted" },
  ]);

  expect(project.read("existing.txt")).toBe("Keep me.\n");

  await filesystem.write("blocker/unwritable.txt", "fail");

  await expect(filesystem.flush()).rejects.toThrow();

  expect(project.read("existing.txt")).toBe("Keep me.\n");

  filesystem.discard();

  expect(await filesystem.exists("existing.txt")).toBe(true);

  await filesystem.remove("existing.txt");

  expect(await filesystem.flush()).toEqual([
    { file: "existing.txt", status: "deleted" },
  ]);

  expect(existsSync(project.resolve("existing.txt"))).toBe(false);
});
