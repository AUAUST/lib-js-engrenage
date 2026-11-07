import { describe, expect, test } from "vitest";

import { loadConfig } from "#project/config/operations/loadConfig";
import { createGitRepository } from "#tests/utils/createGitRepository";
import { gitSection } from "#tools/git/config/sections/gitSection";
import { listLocalFiles } from "#tools/git/operations/listLocalFiles";

describe("listLocalFiles", () => {
  test("uses ordered Git patterns for drafts and ignored files", async () => {
    const { project, git } = await createGitRepository(
      { "package.json": '{"type":"module"}', ".gitignore": "node_modules\n" },
      [],
    );

    project.write(".ai/issues/1.md", "draft\n");
    project.write(".env.local", "SECRET=value\n");
    project.write(".env.example", "SECRET=\n");

    git("add", "--force", ".ai/issues/1.md", ".env.local", ".env.example");

    const resolved = await (await loadConfig(project.root)).resolve(gitSection);

    expect(
      await listLocalFiles(
        resolved,
        project.root,
        [".env.*", "!.env.example", ".ai/issues/"],
        [".ai/issues/1.md", ".env.local", ".env.example"],
      ),
    ).toEqual([".ai/issues/1.md", ".env.local"]);

    expect(
      await listLocalFiles(resolved, project.root, [], [".env.local"]),
    ).toEqual([]);

    expect(
      await listLocalFiles(resolved, project.root, [".env.*"], []),
    ).toEqual([]);
  });

  test("anchors a subproject's dist pattern to that subproject", async () => {
    const { project, git } = await createGitRepository(
      { "package.json": '{"type":"module"}', ".gitignore": "node_modules\n" },
      [],
    );

    project.write("dist/root.txt", "root\n");
    project.write("packages/app/dist/app.txt", "app\n");
    project.write("packages/app/nested/dist/nested.txt", "nested\n");
    project.write("packages/app/package.json", '{"type":"module"}');

    git(
      "add",
      "--force",
      "dist/root.txt",
      "packages/app/dist/app.txt",
      "packages/app/nested/dist/nested.txt",
    );

    const base = project.resolve("packages/app");

    const resolved = await (await loadConfig(base)).resolve(gitSection);

    expect(
      await listLocalFiles(
        resolved,
        base,
        ["/dist"],
        ["dist/app.txt", "nested/dist/nested.txt"],
      ),
    ).toEqual(["dist/app.txt"]);

    expect(
      await listLocalFiles(
        resolved,
        base,
        ["*.txt", "!nested.txt"],
        ["dist/app.txt", "nested/dist/nested.txt"],
      ),
    ).toEqual(["dist/app.txt"]);
  });
});
