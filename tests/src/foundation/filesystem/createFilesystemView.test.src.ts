import { describe, expect, test } from "vitest";

import { createFilesystem } from "#foundation/filesystem/operations/createFilesystem";
import { createFilesystemView } from "#foundation/filesystem/operations/createFilesystemView";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";

describe("createFilesystemView", () => {
  test("reads and globs relative to its directory", async () => {
    const project = createTemporaryProject({
      "package.json": "root\n",
      "theme/package.json": "theme\n",
      "theme/src/index.ts": "",
      "theme/src/ui/button.ts": "",
      "src/index.ts": "",
    });

    const filesystem = createFilesystem(project.root);
    const view = createFilesystemView(filesystem, project.root, "theme");

    expect(await view.read("package.json")).toBe("theme\n");

    expect(await view.glob("src/**/*.ts")).toEqual([
      "src/index.ts",
      "src/ui/button.ts",
    ]);

    expect(await view.glob("src/**/*.ts", { exclude: ["src/ui"] })).toEqual([
      "src/index.ts",
    ]);

    expect(await view.hasFile("src", { skip: ["src/*.ts", "src/ui"] })).toBe(
      false,
    );

    await expect(view.glob("../src/**")).rejects.toThrow("escapes");
  });

  test("stages writes into its parent's changes", async () => {
    const project = createTemporaryProject({
      "theme/package.json": "theme\n",
    });

    const filesystem = createFilesystem(project.root);
    const view = createFilesystemView(filesystem, project.root, "theme");

    await view.write("package.json", "changed\n");

    await view.write("src/created.ts", "");

    const expected = [
      { file: "theme/package.json", status: "synced" },
      { file: "theme/src/created.ts", status: "created" },
    ];

    expect(filesystem.changes()).toEqual(expected);
    expect(view.changes()).toEqual(expected);
    expect(await view.list("src")).toEqual(["src/created.ts"]);
    expect(view.discard()).toEqual(expected);
    expect(filesystem.changes()).toEqual([]);
  });
});
