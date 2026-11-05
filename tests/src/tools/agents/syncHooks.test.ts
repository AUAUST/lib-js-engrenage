import { describe, expect, test } from "vitest";

import { loadConfig } from "@auaust/engrenage";
import { syncClaudeSettings } from "@auaust/engrenage/agents/claude";

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
    ],
  },
});

describe("syncHooks", () => {
  test("keeps only the produced hooks and the user's own, idempotently", async () => {
    const project = createTemporaryProject({
      "engrenage.config.ts":
        'export default { agents: { preferred: ["claude"] } };\n',
      "package.json": '{"type":"module"}',
      ".claude/settings.json": settings,
    });

    const config = await loadConfig(project.root);

    await syncClaudeSettings(config);
    await config.context.filesystem.flush();

    const { hooks } = JSON.parse(project.read(".claude/settings.json"));

    expect(hooks.PostToolUse).toBeUndefined();

    expect(hooks.PreToolUse).toEqual([
      { matcher: "Bash", hooks: [{ type: "command", command: "echo mine" }] },
      ...["create", "edit", "comment"].map((verb) => {
        return {
          matcher: "Bash",
          hooks: [
            {
              type: "command",
              command: "pnpm --silent engrenage agents claude hook github",
              if: `Bash(gh issue ${verb} *)`,
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
            },
          ],
        };
      }),
    ]);

    await syncClaudeSettings(config);

    expect(config.context.filesystem.discard()).toEqual([]);
  });
});
