import { spawnSync } from "node:child_process";
import { chmodSync, realpathSync } from "node:fs";

import { parse as parseJsonc } from "jsonc-parser";
import { expect, test } from "vitest";

import { syncClaudeSettings } from "@auaust/engrenage/agents/claude";
import { syncCodexFiles } from "@auaust/engrenage/agents/codex";
import { loadConfig } from "@auaust/engrenage/extensions";

import { createTemporaryProject } from "#tests/utils/createTemporaryProject";

const fakeProgram = "#!/bin/sh\npwd\nprintf '%s\\n' \"$@\"\n";

const legacy = `engrenage_hook_root="$(node -e 'process.stdout.write(process.cwd())')" && cd -- "$engrenage_hook_root" && pnpm --silent engrenage agents claude hook`;

async function createCommand(): Promise<string> {
  const project = createTemporaryProject({
    "package.json": '{"type":"module"}',
    "engrenage.config.ts": 'export default { agents: { preferred: ["claude"] } };',
    ".claude/settings.json": "{}",
  });

  const config = await loadConfig(project.root);

  await syncClaudeSettings(config);

  await config.context.filesystem.flush();

  const { hooks } = JSON.parse(project.read(".claude/settings.json"));

  return hooks.PreToolUse[0].hooks[0].command;
}

function run(
  command: string,
  cwd: string,
  environment: Record<string, string> = {},
) {
  const { CLAUDE_PROJECT_DIR: _project, ...inherited } = process.env;

  return spawnSync("sh", ["-c", command], {
    cwd,
    env: { ...inherited, ...environment },
    encoding: "utf-8",
  });
}

function createConsumer(files: Record<string, string> = {}) {
  const project = createTemporaryProject({
    "package.json": '{"type":"module"}',
    "node_modules/.bin/engrenage-hook": fakeProgram,
    ...files,
  });

  chmodSync(project.resolve("node_modules/.bin/engrenage-hook"), 0o755);

  return { project, root: realpathSync(project.root) };
}

test("the generated command finds the root from a nested directory", async () => {
  const command = await createCommand();

  const { project, root } = createConsumer({ "nested/deeper/keep": "" });

  const result = run(command, project.resolve("nested/deeper"));

  expect(result.status, result.stderr).toBe(0);
  expect(result.stdout).toBe(`${root}\nclaude\nPreToolUse\n`);
});

test("the generated command runs the root's program from a workspace", async () => {
  const command = await createCommand();

  const { project, root } = createConsumer({
    "pnpm-workspace.yaml": "packages:\n  - theme\n",
    "theme/package.json": "{}",
  });

  const result = run(command, project.resolve("theme"));

  expect(result.status, result.stderr).toBe(0);
  expect(result.stdout).toBe(`${root}\nclaude\nPreToolUse\n`);
});

test("the generated command stops at a nested worktree before its install", async () => {
  const command = await createCommand();

  const worktree = ".codex/worktrees/fresh";

  const { project } = createConsumer({
    ".git/HEAD": "ref: refs/heads/main\n",
    [`${worktree}/.git`]: "gitdir: ../../../.git/worktrees/fresh\n",
    [`${worktree}/package.json`]: "{}",
    [`${worktree}/nested/keep`]: "",
  });

  const result = run(command, project.resolve(`${worktree}/nested`));

  expect(result.status, result.stderr).toBe(0);

  expect(result.stdout).toBe(
    '{"systemMessage":"engrenage hooks are off: engrenage-hook is not installed in this project; run pnpm install"}\n',
  );
});

test("the generated command stops at the workspace root before its install", async () => {
  const command = await createCommand();

  const { project } = createConsumer({
    "outer/pnpm-workspace.yaml": "packages:\n  - theme\n",
    "outer/theme/package.json": "{}",
  });

  const result = run(command, project.resolve("outer/theme"));

  expect(result.status, result.stderr).toBe(0);

  expect(result.stdout).toBe(
    '{"systemMessage":"engrenage hooks are off: engrenage-hook is not installed in this project; run pnpm install"}\n',
  );
});

test("the generated command skips a package inside node_modules", async () => {
  const command = await createCommand();

  const inner = "node_modules/.pnpm/x/node_modules/@auaust/engrenage";

  const { project, root } = createConsumer({
    [`${inner}/package.json`]: "{}",
  });

  const result = run(command, project.resolve(inner));

  expect(result.status, result.stderr).toBe(0);
  expect(result.stdout).toBe(`${root}\nclaude\nPreToolUse\n`);
});

test("the generated command runs in CLAUDE_PROJECT_DIR", async () => {
  const command = await createCommand();

  const { root } = createConsumer();

  const other = createTemporaryProject({ "package.json": "{}" });

  const result = run(command, other.root, { CLAUDE_PROJECT_DIR: root });

  expect(result.status, result.stderr).toBe(0);
  expect(result.stdout).toBe(`${root}\nclaude\nPreToolUse\n`);
});

test("the generated command runs the source program without the bin", async () => {
  const command = await createCommand();

  const project = createTemporaryProject({
    "package.json": '{"type":"module"}',
    "bin/engrenage-hook/executable.ts": "console.log(process.argv.slice(2).join(' '));\n",
  });

  const result = run(command, project.root);

  expect(result.status, result.stderr).toBe(0);
  expect(result.stdout).toBe("claude PreToolUse\n");
});

test("the generated command asks for an install without bin or source", async () => {
  const command = await createCommand();

  const project = createTemporaryProject({ "package.json": "{}" });

  const result = run(command, project.root);

  expect(result.status, result.stderr).toBe(0);

  expect(result.stdout).toBe(
    '{"systemMessage":"engrenage hooks are off: engrenage-hook is not installed in this project; run pnpm install"}\n',
  );
});

test("sync replaces the old entries with one per event, keeping the user's, idempotently", async () => {
  const project = createTemporaryProject({
    "engrenage.config.ts": 'export default { agents: { preferred: ["claude"] } };\n',
    "package.json": '{"type":"module"}',
    ".claude/settings.json": JSON.stringify({
      hooks: {
        PreToolUse: [
          {
            matcher: "Bash",
            hooks: [
              {
                type: "command",
                command: "echo mine",
              },
              {
                type: "command",
                command: `${legacy} github || exit 2`,
                if: "Bash(gh issue create *)",
                onFailure: "block",
              },
            ],
          },
          {
            matcher: "Bash",
            hooks: [
              {
                type: "command",
                command: `${legacy} git || exit 2`,
                if: "Bash(git commit *)",
                onFailure: "block",
              },
            ],
          },
        ],
        Stop: [
          {
            matcher: "*",
            hooks: [{ type: "command", command: `${legacy} stop || exit 2` }],
          },
        ],
      },
    }),
  });

  const config = await loadConfig(project.root);

  await syncClaudeSettings(config);

  await config.context.filesystem.flush();

  const { hooks } = JSON.parse(project.read(".claude/settings.json"));

  expect(hooks.PreToolUse[0]).toEqual({
    matcher: "Bash",
    hooks: [{ type: "command", command: "echo mine" }],
  });

  expect(JSON.stringify(hooks)).not.toContain("engrenage agents claude hook");

  for (const event of [
    "PreToolUse",
    "PostToolUse",
    "SubagentStart",
    "Stop",
    "SubagentStop",
  ]) {
    const owned = (hooks[event] as { hooks: { command: string }[] }[])
      .flatMap((group) => group.hooks)
      .filter(({ command }) => command.includes("engrenage-hook claude "));

    expect(owned, event).toHaveLength(1);
  }

  await syncClaudeSettings(config);

  expect(config.context.filesystem.discard()).toEqual([]);
});

test("syncs Codex hooks and preserves unrelated custom hooks", async () => {
  const project = createTemporaryProject({
    "package.json": '{"type":"module"}',
    "engrenage.config.ts": 'export default { agents: { preferred: ["codex"], codexHooks: true } };',
    ".codex/hooks.json": JSON.stringify({
      hooks: {
        PreToolUse: [
          {
            matcher: "Bash",
            hooks: [
              {
                type: "command",
                command: "echo mine",
                custom: { keep: true },
              },
              {
                type: "command",
                command: "pnpm --silent engrenage agents codex hook old",
              },
            ],
          },
        ],
      },
    }).replace(
      '"command":"echo mine"',
      '"command":"echo mine"/* retained custom comment */',
    ),
  });

  const config = await loadConfig(project.root);

  await syncCodexFiles(config);

  await config.context.filesystem.flush();

  const content = project.read(".codex/hooks.json");

  expect(content).toContain("/* retained custom comment */");

  const { hooks } = parseJsonc(content);

  expect(hooks.PreToolUse[0]).toEqual({
    matcher: "Bash",
    hooks: [
      {
        type: "command",
        command: "echo mine",
        custom: { keep: true },
      },
    ],
  });

  expect(hooks.SubagentStop[0].hooks[0].command).toContain(
    "engrenage-hook codex SubagentStop",
  );

  expect(hooks.PreToolUse[1].matcher).toBe("^(spawn_agent|Agent|Bash)$");

  await syncCodexFiles(config);

  expect(config.context.filesystem.changes()).toEqual([]);
});
