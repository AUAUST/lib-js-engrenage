import { spawnSync } from "node:child_process";
import { chmodSync } from "node:fs";

import { parse as parseJsonc } from "jsonc-parser";
import { describe, expect, test } from "vitest";

import { syncClaudeSettings } from "@auaust/engrenage/agents/claude";
import { syncCodexFiles } from "@auaust/engrenage/agents/codex";
import { loadConfig } from "@auaust/engrenage/extensions";

import { createTemporaryProject } from "#tests/utils/createTemporaryProject";

const settings = JSON.stringify({
  hooks: {
    PostToolUse: [
      {
        matcher: "Edit|MultiEdit|Write",
        hooks: [
          {
            type: "command",
            command: "pnpm --silent engrenage agents claude hook edit",
          },
        ],
      },
    ],
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
            command: "pnpm --silent engrenage agents claude hook github",
            if: "Bash(gh issue *)",
          },
        ],
      },
      {
        matcher: "Agent|Task",
        hooks: [
          {
            type: "command",
            command: "pnpm --silent engrenage agents claude hook dispatch",
            if: "Agent(worker)",
          },
        ],
      },
    ],
  },
});

describe("syncHooks", () => {
  test("keeps only the produced hooks and the user's own, idempotently", async () => {
    const project = createTemporaryProject({
      "engrenage.config.ts": 'export default { agents: { preferred: ["claude"] } };\n',
      "package.json": '{"type":"module"}',
      ".claude/settings.json": settings,
    });

    const config = await loadConfig(project.root);

    await syncClaudeSettings(config);

    await config.context.filesystem.flush();

    const { hooks } = JSON.parse(project.read(".claude/settings.json"));

    expect(JSON.stringify(hooks.PostToolUse)).not.toContain("hook edit");

    expect(hooks.PreToolUse[0]).toEqual({
      matcher: "Bash",
      hooks: [{ type: "command", command: "echo mine" }],
    });

    expect(
      hooks.PreToolUse.slice(1).map(
        (group: {
          matcher: string;
          hooks: { command: string; if: string; onFailure: string }[];
        }) => {
          return {
            matcher: group.matcher,
            hooks: group.hooks.map((entry) => {
              return {
                ...entry,
                command: entry.command
                  .slice(entry.command.lastIndexOf(" && ") + 4)
                  .replace(/ \|\| exit 2$/, ""),
              };
            }),
          };
        },
      ),
    ).toEqual([
      ...["create", "edit", "comment"].map((verb) => {
        return {
          matcher: "Bash",
          hooks: [
            {
              type: "command",
              command: "pnpm --silent engrenage agents claude hook github",
              if: `Bash(gh issue ${verb} *)`,
              onFailure: "block",
            },
          ],
        };
      }),
      ...["commit", "-c", "-C", "config"].map((start) => {
        return {
          matcher: "Bash",
          hooks: [
            {
              type: "command",
              command: "pnpm --silent engrenage agents claude hook git",
              if: `Bash(git ${start} *)`,
              onFailure: "block",
            },
          ],
        };
      }),
      {
        matcher: "Agent|Task",
        hooks: [
          {
            type: "command",
            command: "pnpm --silent engrenage agents claude hook dispatch",
            onFailure: "block",
          },
        ],
      },
    ]);

    expect(
      hooks.PreToolUse.slice(1).every(
        (group: { hooks: { command: string; onFailure: string }[] }) => {
          return group.hooks.every((entry) => {
            return (
              entry.command.startsWith("engrenage_hook_root=") &&
              entry.onFailure === "block"
            );
          });
        },
      ),
    ).toBe(true);

    await syncClaudeSettings(config);

    expect(config.context.filesystem.discard()).toEqual([]);
  });
});

test("resolves generated commands from a nested consumer directory", async () => {
  const project = createTemporaryProject({
    "package.json": '{"type":"module"}',
    "engrenage.config.ts": 'export default { agents: { preferred: ["claude"] } };',
    ".claude/settings.json": "{}",
    "nested/deeper/keep": "",
    "bin/pnpm": "#!/bin/sh\npwd\nprintf '%s\\n' \"$@\"\n",
  });

  chmodSync(project.resolve("bin/pnpm"), 0o755);

  const config = await loadConfig(project.root);

  await syncClaudeSettings(config);

  await config.context.filesystem.flush();

  const { hooks } = JSON.parse(project.read(".claude/settings.json"));
  const command = hooks.PreToolUse[0].hooks[0].command;

  const result = spawnSync("sh", ["-c", command], {
    cwd: project.resolve("nested/deeper"),
    env: {
      ...process.env,
      PATH: `${project.resolve("bin")}:${process.env.PATH ?? ""}`,
    },
    encoding: "utf-8",
  });

  expect(result.status, result.stderr).toBe(0);

  expect(result.stdout).toContain(
    `${project.root}\n--silent\nengrenage\nagents\nclaude\nhook\ngithub\n`,
  );
});

test("syncs Codex SubagentStop and preserves unrelated custom hooks", async () => {
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
    "engrenage agents codex hook stop",
  );

  expect(
    hooks.PreToolUse.some(
      (group: { matcher: string }) => group.matcher === "^Bash$",
    ),
  ).toBe(true);

  await syncCodexFiles(config);

  expect(config.context.filesystem.changes()).toEqual([]);
});

test("package-resolution failure exits 2 before running a successful child command", async () => {
  const project = createTemporaryProject({
    "package.json": '{"type":"module"}',
    "engrenage.config.ts": 'export default { agents: { preferred: ["claude"] } };',
    ".claude/settings.json": "{}",
  });

  const config = await loadConfig(project.root);

  await syncClaudeSettings(config);

  await config.context.filesystem.flush();

  const command = JSON.parse(project.read(".claude/settings.json")).hooks
    .PreToolUse[0].hooks[0].command;

  const empty = createTemporaryProject({
    "bin/pnpm": "#!/bin/sh\necho child-started\n",
  });

  chmodSync(empty.resolve("bin/pnpm"), 0o755);

  const result = spawnSync("sh", ["-c", command], {
    cwd: empty.root,
    env: {
      ...process.env,
      PATH: `${empty.resolve("bin")}:${process.env.PATH ?? ""}`,
    },
    encoding: "utf-8",
  });

  expect(result.status).toBe(2);
  expect(result.stderr).toContain("No consumer package found");
  expect(result.stdout).toBe("");
});
