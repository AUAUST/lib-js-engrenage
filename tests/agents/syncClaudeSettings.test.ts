import { describe, expect, test } from "vitest";

import { syncClaudeSettings } from "@auaust/engrenage/agents";
import { loadConfig } from "@auaust/engrenage/config";

import { createTemporaryProject } from "#tests/helpers/createTemporaryProject";

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
      "engrenage.config.ts": "export default {};\n",
      "package.json": "{}",
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
            "command": "pnpm --silent engrenage claude hook edit"
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
        "export default { agents: { claudeSettings: false } };\n",
      "package.json": "{}",
    });

    const config = await loadConfig(project.root);

    syncClaudeSettings(config, {
      settings: true,
    });

    expect(config.filesystem.discard()).toEqual([]);

    const enabled = await loadConfig(
      createTemporaryProject({
        "engrenage.config.ts": "export default {};\n",
        "package.json": "{}",
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
