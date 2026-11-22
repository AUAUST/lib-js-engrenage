import { describe, expect, test } from "vitest";
import { parse } from "yaml";

import { loadConfig } from "#project/config/operations/loadConfig";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { syncLefthookConfig } from "#tools/lefthook/setup/syncLefthookConfig";

function createProject(
  lefthook: string,
  config = 'export default { agents: { preferred: ["claude"] } };\n',
) {
  return createTemporaryProject({
    "engrenage.config.ts": config,
    "package.json": '{"type":"module"}',
    "lefthook.yml": lefthook,
  });
}

describe("syncLefthookConfig", () => {
  test.each([
    "export default {};\n",
    'export default { agents: { preferred: ["claude"], gate: { hook: false } } };\n',
  ])(
    "keeps only the unconditional everyone command without agent variables: %s",
    async (input) => {
      const project = createProject(
        "pre-commit:\n  commands:\n    engrenage:\n      run: stale\n",
        input,
      );

      const config = await loadConfig(project.root);

      await syncLefthookConfig(config);

      await config.context.filesystem.flush();

      expect(parse(project.read("lefthook.yml"))).toEqual({
        "pre-commit": {
          commands: {
            "engrenage-local": {
              run: "pnpm --silent --config.verify-deps-before-run=false engrenage gate --staged --everyone",
            },
          },
        },
        "commit-msg": {
          commands: {
            "engrenage-local": {
              run: 'pnpm --silent --config.verify-deps-before-run=false engrenage gate --message "{1}" --everyone',
            },
          },
        },
      });
    },
  );

  test("keeps the everyone command when local file patterns are empty", async () => {
    const project = createProject(
      "pre-commit:\n  commands:\n    engrenage-local:\n      run: stale\n",
      'export default { agents: { preferred: ["claude"] }, git: { local: { files: [] } } };\n',
    );

    const config = await loadConfig(project.root);

    await syncLefthookConfig(config);

    await config.context.filesystem.flush();

    expect(parse(project.read("lefthook.yml"))).toEqual({
      "pre-commit": {
        commands: {
          "engrenage": {
            only: [{ run: 'test -n "$CLAUDECODE"' }],
            run: "pnpm --silent --config.verify-deps-before-run=false engrenage gate --staged",
          },
          "engrenage-local": {
            skip: [{ run: 'test -n "$CLAUDECODE"' }],
            run: "pnpm --silent --config.verify-deps-before-run=false engrenage gate --staged --everyone",
          },
        },
      },
      "commit-msg": {
        commands: {
          "engrenage": {
            only: [{ run: 'test -n "$CLAUDECODE"' }],
            run: 'pnpm --silent --config.verify-deps-before-run=false engrenage gate --message "{1}"',
          },
          "engrenage-local": {
            skip: [{ run: 'test -n "$CLAUDECODE"' }],
            run: 'pnpm --silent --config.verify-deps-before-run=false engrenage gate --message "{1}" --everyone',
          },
        },
      },
    });
  });

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

    expect(parse(content)).toMatchObject({
      "pre-commit": {
        commands: {
          "engrenage": {
            only: [{ run: 'test -n "$CLAUDECODE"' }],
            run: "pnpm --silent --config.verify-deps-before-run=false engrenage gate --staged",
          },
          "engrenage-local": {
            skip: [{ run: 'test -n "$CLAUDECODE"' }],
            run: "pnpm --silent --config.verify-deps-before-run=false engrenage gate --staged --everyone",
          },
        },
      },
    });

    await syncLefthookConfig(config);

    expect(config.context.filesystem.changes()).toEqual([]);
  });

  test("writes a shared condition in full, without anchors or aliases", async () => {
    const project = createProject("pre-commit:\n  commands: {}\n");

    const config = await loadConfig(project.root);

    await syncLefthookConfig(config);

    await config.context.filesystem.flush();

    const content = project.read("lefthook.yml");

    expect(content).not.toMatch(/&\w|\*\w/);
    expect(content.match(/CLAUDECODE/g)).toHaveLength(4);
  });

  test("rewrites a changed condition", async () => {
    const project = createProject(
      'pre-commit:\n  commands:\n    engrenage:\n      only:\n        - run: test -n "$OTHER"\n      run: pnpm --silent --config.verify-deps-before-run=false engrenage gate --staged\n',
    );

    const config = await loadConfig(project.root);

    await syncLefthookConfig(config);

    await config.context.filesystem.flush();

    expect(project.read("lefthook.yml")).toContain("$CLAUDECODE");
    expect(project.read("lefthook.yml")).not.toContain("$OTHER");
  });

  test("quotes a stale unquoted message path", async () => {
    const project = createProject(
      "commit-msg:\n  commands:\n    engrenage-local:\n      run: pnpm --silent --config.verify-deps-before-run=false engrenage gate --message {1} --everyone\n",
    );

    const config = await loadConfig(project.root);

    await syncLefthookConfig(config);

    await config.context.filesystem.flush();

    expect(parse(project.read("lefthook.yml"))).toMatchObject({
      "commit-msg": {
        commands: {
          "engrenage-local": {
            run: 'pnpm --silent --config.verify-deps-before-run=false engrenage gate --message "{1}" --everyone',
          },
        },
      },
    });
  });

  test("rewrites an equal command holding an anchor", async () => {
    const project = createProject(
      'pre-commit:\n  commands:\n    engrenage:\n      only:\n        - &a1\n          run: test -n "$CLAUDECODE"\n      run: pnpm --silent --config.verify-deps-before-run=false engrenage gate --staged\n',
    );

    const before = parse(project.read("lefthook.yml"));

    const config = await loadConfig(project.root);

    await syncLefthookConfig(config);

    await config.context.filesystem.flush();

    const content = project.read("lefthook.yml");

    expect(content).not.toContain("&a1");

    expect(parse(content)["pre-commit"].commands.engrenage).toEqual(
      before["pre-commit"].commands.engrenage,
    );

    await syncLefthookConfig(config);

    expect(config.context.filesystem.changes()).toEqual([]);
  });

  test("copies an anchor of a rewritten command into the aliases outside it", async () => {
    const project = createProject(
      [
        "pre-commit:",
        "  commands:",
        "    engrenage:",
        "      only:",
        "        - &agent",
        '          run: test -n "$OTHER"',
        "      run: pnpm --silent --config.verify-deps-before-run=false engrenage gate --staged",
        "    lint:",
        "      only:",
        "        - *agent",
        "      run: echo lint",
        "",
      ].join("\n"),
    );

    const config = await loadConfig(project.root);

    await syncLefthookConfig(config);

    await config.context.filesystem.flush();

    const content = project.read("lefthook.yml");

    expect(content).not.toMatch(/&agent|\*agent/);

    expect(parse(content)["pre-commit"].commands.lint).toEqual({
      only: [{ run: 'test -n "$OTHER"' }],
      run: "echo lint",
    });
  });

  test("copies an anchor of a removed command into the aliases outside it", async () => {
    const project = createProject(
      [
        "pre-commit:",
        "  commands:",
        "    engrenage:",
        "      run: &gate stale",
        "    lint:",
        "      run: *gate",
        "",
      ].join("\n"),
      "export default {};\n",
    );

    const config = await loadConfig(project.root);

    await syncLefthookConfig(config);

    await config.context.filesystem.flush();

    const parsed = parse(project.read("lefthook.yml"));

    expect(parsed["pre-commit"].commands.engrenage).toBeUndefined();
    expect(parsed["pre-commit"].commands.lint).toEqual({ run: "stale" });
  });
});
