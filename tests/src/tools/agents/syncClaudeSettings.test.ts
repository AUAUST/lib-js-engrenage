import { describe, expect, test } from "vitest";

import { loadConfig } from "@auaust/engrenage/extensions";
import { syncClaudeSettings } from "@auaust/engrenage/metalbrain/claude";

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
      "Bash(git config core.hooksPath*)",
      "Bash(git push*)"
    ]
  },
  "subagentPromptCacheTtl": "5m"
}
`;

    const current = project.read(".claude/settings.json");

    expect(current).toContain("// Kept by the project.");

    const actual = JSON.parse(current.replace("// Kept by the project.", ""));

    const previous = JSON.parse(
      expected.replace("// Kept by the project.", ""),
    );

    expect(actual.permissions).toEqual(previous.permissions);

    expect(actual.hooks.PreToolUse).toEqual([
      {
        matcher: "Bash|Agent|Task|SendMessage",
        hooks: [
          {
            type: "command",
            command: expect.stringContaining(
              "exec node_modules/.bin/metalbrain hook claude PreToolUse guardToolUse;",
            ),
          },
        ],
      },
      {
        matcher: "*",
        hooks: [
          {
            type: "command",
            command: expect.stringContaining(
              "exec node_modules/.bin/metalbrain hook claude PreToolUse;",
            ),
            async: true,
          },
        ],
      },
    ]);

    await syncClaudeSettings(config);

    expect(config.context.filesystem.discard()).toEqual([]);
  });

  test("writes the configured subagent cache lifetime over another one", async () => {
    const project = createTemporaryProject({
      "engrenage.config.ts": 'export default { agents: { preferred: ["claude"], subagentCacheTtl: "1h" } };\n',
      "package.json": '{"type":"module"}',
      ".claude/settings.json": '{\n  "subagentPromptCacheTtl": "5m"\n}\n',
    });

    const config = await loadConfig(project.root);

    await syncClaudeSettings(config);

    await config.context.filesystem.flush();

    expect(project.read(".claude/settings.json")).toContain(
      '"subagentPromptCacheTtl": "1h"',
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
