import { describe, expect, test } from "vitest";

import { loadConfig } from "#project/config/operations/loadConfig";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { syncLefthookConfig } from "#tools/lefthook/setup/syncLefthookConfig";

function createProject(lefthook: string) {
  return createTemporaryProject({
    "engrenage.config.ts":
      'export default { agents: { preferred: ["claude"] } };\n',
    "package.json": '{"type":"module"}',
    "lefthook.yml": lefthook,
  });
}

describe("syncLefthookConfig", () => {
  test("keeps the user's commands and comments, and adds the gate once", async () => {
    const project = createProject(
      "# mine\npre-commit:\n  commands:\n    lint:\n      run: echo lint\n",
    );

    const config = await loadConfig(project.root);

    await syncLefthookConfig(config);
    await config.context.filesystem.flush();

    const content = project.read("lefthook.yml");

    expect(content).toContain("# mine");
    expect(content).toContain("run: echo lint");
    expect(content).toContain('- run: test -n "$CLAUDECODE"');
    expect(content).toContain("run: pnpm --silent engrenage gate --staged");

    await syncLefthookConfig(config);

    expect(config.context.filesystem.changes()).toEqual([]);
  });

  test("rewrites a changed condition", async () => {
    const project = createProject(
      'pre-commit:\n  commands:\n    engrenage:\n      only:\n        - run: test -n "$OTHER"\n      run: pnpm --silent engrenage gate --staged\n',
    );

    const config = await loadConfig(project.root);

    await syncLefthookConfig(config);
    await config.context.filesystem.flush();

    expect(project.read("lefthook.yml")).toContain("$CLAUDECODE");
    expect(project.read("lefthook.yml")).not.toContain("$OTHER");
  });
});
