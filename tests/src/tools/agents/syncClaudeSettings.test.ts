import { describe, expect, test } from "vitest";

import { loadConfig } from "@auaust/engrenage";
import { syncClaudeSettings } from "@auaust/engrenage/agents/claude";

import { createTemporaryProject } from "#tests/utils/createTemporaryProject";

const settings = `{
  // Kept by the project.
  "permissions": {
    "deny": ["Read(**/.env)"]
  }
}
`;

describe("syncClaudeSettings", () => {
  test("adds the edit hook to existing settings once", async () => {
    const project = createTemporaryProject({
      "engrenage.config.ts":
        'export default { agents: { preferred: ["claude"] } };\n',
      "package.json": '{"type":"module"}',
      ".claude/settings.json": settings,
    });

    const config = await loadConfig(project.root);

    syncClaudeSettings(config);

    config.filesystem.flush();

    expect(project.read(".claude/settings.json")).toBe(`{
  // Kept by the project.
  "permissions": {
    "deny": ["Read(**/.env)"]
  },
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|MultiEdit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "pnpm --silent engrenage agents claude hook edit"
          }
        ]
      }
    ],
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "pnpm --silent engrenage agents claude hook github",
            "if": "Bash(gh issue *)"
          }
        ]
      }
    ]
  }
}
`);

    syncClaudeSettings(config);

    expect(config.filesystem.discard()).toEqual([]);
  });

  test("creates missing settings only when asked, unless disabled", async () => {
    const project = createTemporaryProject({
      "engrenage.config.ts":
        'export default { agents: { preferred: ["claude"], claudeSettings: false } };\n',
      "package.json": '{"type":"module"}',
    });

    const config = await loadConfig(project.root);

    syncClaudeSettings(config, {
      settings: true,
    });

    expect(config.filesystem.discard()).toEqual([]);

    const enabled = await loadConfig(
      createTemporaryProject({
        "engrenage.config.ts":
          'export default { agents: { preferred: ["claude"] } };\n',
        "package.json": '{"type":"module"}',
      }).root,
    );

    syncClaudeSettings(enabled);

    expect(enabled.filesystem.discard()).toEqual([]);

    syncClaudeSettings(enabled, {
      settings: true,
    });

    expect(enabled.filesystem.flush()).toEqual([
      {
        file: ".claude/settings.json",
        status: "created",
      },
    ]);
  });
});
