import { mkdirSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, test } from "vitest";

import { entries } from "@auaust/toolkit/object";

import { loadConfig } from "#project/config/operations/loadConfig";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { resolvePrettierAllArguments } from "#tools/prettier/index";

const files = {
  "engrenage.config.ts": 'export default { workspaces: { "packages/*": { name: "@scope/{dir}" } } };\n',
  "package.json": JSON.stringify({
    type: "module",
    devDependencies: { prettier: "*" },
  }),
  "tsconfig.json": "{}",
  "src/index.ts": "",
  "env.d.ts": "",
  "lefthook.yml": "",
  "packages/a/package.json": "{}",
  "README.md": "",
  "notes/todo.md": "",
};

async function resolvePaths(root: string): Promise<readonly string[]> {
  const args = await resolvePrettierAllArguments(await loadConfig(root), []);

  return args.filter((arg) => !arg.startsWith("--"));
}

describe("resolvePrettierAllArguments", () => {
  test("covers the environments, the workspaces and the files engrenage owns, never undeclared ones", async () => {
    const project = createTemporaryProject(files);

    const paths = await resolvePaths(project.root);

    expect(paths).toEqual(
      expect.arrayContaining([
        project.resolve("env.d.ts"),
        project.resolve("lefthook.yml"),
        project.resolve("packages/a"),
      ]),
    );

    expect(paths).not.toContain(project.resolve("README.md"));

    expect(paths).not.toContain(project.resolve("notes"));

    expect(paths).not.toContain(project.resolve("notes/todo.md"));
  });

  test("leaves out the GitHub workflows of a project in a repository subdirectory", async () => {
    const repository = createTemporaryProject({
      ".github/workflows/ci.yml": "",
      ".github/workflows/publish.yml": "",
    });

    mkdirSync(repository.resolve(".git"));

    for (const [path, content] of entries(files)) {
      repository.write(join("app", path), content);
    }

    repository.write(
      "app/engrenage.config.ts",
      'export default { github: { workflows: "library" } };\n',
    );

    const paths = await resolvePaths(repository.resolve("app"));

    expect(paths).toContain(repository.resolve("app/lefthook.yml"));

    expect(
      paths.some((path) => path.startsWith(repository.resolve(".github"))),
    ).toBe(false);
  });
});
