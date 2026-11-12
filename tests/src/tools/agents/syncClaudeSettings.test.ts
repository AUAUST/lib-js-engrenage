import { describe, expect, test } from "vitest";

import { syncClaudeSettings } from "@auaust/engrenage/agents/claude";
import { loadConfig } from "@auaust/engrenage/extensions";

import { createTemporaryProject } from "#tests/utils/createTemporaryProject";

const settings = `{
  // Kept by the project.
  "permissions": {
    "deny": ["Read(**/.env)"]
  }
}
`;

describe("syncClaudeSettings", () => {
  test("adds the hooks to existing settings once", async () => {
    const project = createTemporaryProject({
      "engrenage.config.ts": 'export default { agents: { preferred: ["claude"] } };\n',
      "package.json": '{"type":"module"}',
      ".claude/settings.json": settings,
    });

    const config = await loadConfig(project.root);

    await syncClaudeSettings(config);

    await config.context.filesystem.flush();

    const expected = `{
  // Kept by the project.
  "permissions": {
    "deny": [
      "Read(**/.env)",
      "Bash(git commit --no-verify*)",
      "Bash(git commit -n*)",
      "Bash(LEFTHOOK=0 *)",
      "Bash(LEFTHOOK=false *)",
      "Bash(git config core.hooksPath*)"
    ]
  },
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "pnpm --silent engrenage agents claude hook github",
            "if": "Bash(gh issue create *)"
          }
        ]
      },
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "pnpm --silent engrenage agents claude hook github",
            "if": "Bash(gh issue edit *)"
          }
        ]
      },
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "pnpm --silent engrenage agents claude hook github",
            "if": "Bash(gh issue comment *)"
          }
        ]
      },
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "pnpm --silent engrenage agents claude hook git",
            "if": "Bash(git commit *)"
          }
        ]
      },
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "pnpm --silent engrenage agents claude hook git",
            "if": "Bash(git -c *)"
          }
        ]
      },
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "pnpm --silent engrenage agents claude hook git",
            "if": "Bash(git -C *)"
          }
        ]
      },
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "pnpm --silent engrenage agents claude hook git",
            "if": "Bash(git config *)"
          }
        ]
      },
      {
        "matcher": "Agent|Task",
        "hooks": [
          {
            "type": "command",
            "command": "pnpm --silent engrenage agents claude hook dispatch"
          }
        ]
      }
    ]
  },
  "subagentPromptCacheTtl": "1h"
}
`;

    const current = project.read(".claude/settings.json");

    expect(current).toContain("// Kept by the project.");

    const actual = JSON.parse(current.replace("// Kept by the project.", ""));

    const previous = JSON.parse(
      expected.replace("// Kept by the project.", ""),
    );

    expect(actual.permissions).toEqual(previous.permissions);

    expect(
      actual.hooks.PreToolUse.map(
        (group: {
          matcher: string;
          hooks: { command: string; if: string; onFailure: string }[];
        }) => {
          return {
            matcher: group.matcher,
            hooks: group.hooks.map(({ onFailure: _onFailure, ...entry }) => {
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
    ).toEqual(previous.hooks.PreToolUse);

    expect(
      actual.hooks.PreToolUse.every(
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

  test("writes the configured subagent cache lifetime over another one", async () => {
    const project = createTemporaryProject({
      "engrenage.config.ts": 'export default { agents: { preferred: ["claude"], subagentCacheTtl: "5m" } };\n',
      "package.json": '{"type":"module"}',
      ".claude/settings.json": '{\n  "subagentPromptCacheTtl": "1h"\n}\n',
    });

    const config = await loadConfig(project.root);

    await syncClaudeSettings(config);

    await config.context.filesystem.flush();

    expect(project.read(".claude/settings.json")).toContain(
      '"subagentPromptCacheTtl": "5m"',
    );
  });

  test("creates missing settings only when asked, unless disabled", async () => {
    const project = createTemporaryProject({
      "engrenage.config.ts": 'export default { agents: { preferred: ["claude"], claudeSettings: false } };\n',
      "package.json": '{"type":"module"}',
    });

    const config = await loadConfig(project.root);

    await syncClaudeSettings(config, {
      settings: true,
    });

    expect(config.context.filesystem.discard()).toEqual([]);

    const enabled = await loadConfig(
      createTemporaryProject({
        "engrenage.config.ts": 'export default { agents: { preferred: ["claude"] } };\n',
        "package.json": '{"type":"module"}',
      }).root,
    );

    await syncClaudeSettings(enabled);

    expect(enabled.context.filesystem.discard()).toEqual([]);

    await syncClaudeSettings(enabled, {
      settings: true,
    });

    expect(await enabled.context.filesystem.flush()).toEqual([
      {
        file: ".claude/settings.json",
        status: "created",
      },
    ]);
  });
});
