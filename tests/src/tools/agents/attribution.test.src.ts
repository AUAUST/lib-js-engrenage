import { existsSync } from "node:fs";

import { describe, expect, test } from "vitest";

import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { linkSourcePackage } from "#tests/utils/linkSourcePackage";
import { syncClaudeSettings } from "#tools/agents/claude/index";
import { syncAgentFiles } from "#tools/agents/index";
import { loadConfig } from "#workflows/registry/operations/loadConfig";

const hidden = {
  commit: "",
  pr: "",
  sessionUrl: false,
};

const noAttributionRule = ".claude/rules/no-attribution.md";

const attributionRule = ".claude/rules/attribution.md";

function createProject(
  attribution: string,
  files: Record<string, string> = {},
) {
  const project = createTemporaryProject({
    "engrenage.config.ts": `export default { agents: { preferred: ["claude", "codex"]${attribution} } };\n`,
    "package.json": '{"type":"module"}',
    "AGENTS.override.md": "<!-- @rules -->\n<!-- @end -->\n",
    ...files,
  });

  linkSourcePackage(project.resolve("node_modules/@auaust/engrenage"));

  return project;
}

async function sync(root: string) {
  const config = await loadConfig(root);

  syncAgentFiles(config);
  syncClaudeSettings(config);

  return config;
}

describe("agents.attribution", () => {
  test("false hides attribution in new settings and adds the no-attribution rule", async () => {
    const project = createProject(", attribution: false", {
      [attributionRule]:
        "<!-- @reference @auaust/engrenage/agents/rules/attribution.md -->\n<!-- @end -->\n",
    });

    (await sync(project.root)).filesystem.flush();

    expect(JSON.parse(project.read(".claude/settings.json"))).toMatchObject({
      hooks: {
        PostToolUse: [expect.anything()],
      },
      attribution: hidden,
    });

    expect(project.read(noAttributionRule)).toContain(
      "<!-- @reference @auaust/engrenage/agents/rules/no-attribution.md -->",
    );

    expect(existsSync(project.resolve(attributionRule))).toBe(false);
    expect(project.read("AGENTS.override.md")).toContain(noAttributionRule);
    expect((await sync(project.root)).filesystem.discard()).toEqual([]);

    (await loadConfig(project.root)).filesystem.write(
      ".claude/settings.json",
      JSON.stringify({
        model: "opus",
        attribution: { commit: "Custom" },
      }),
    );

    (await sync(project.root)).filesystem.flush();

    expect(JSON.parse(project.read(".claude/settings.json"))).toMatchObject({
      model: "opus",
      attribution: hidden,
    });
  });

  test("false leaves settings alone when claudeSettings is false", async () => {
    const project = createProject(
      ", attribution: false, claudeSettings: false",
    );

    (await sync(project.root)).filesystem.flush();

    expect(existsSync(project.resolve(".claude/settings.json"))).toBe(false);
    expect(existsSync(project.resolve(noAttributionRule))).toBe(true);
  });

  test("true removes only the hiding value and swaps the rules", async () => {
    const project = createProject(", attribution: true", {
      ".claude/settings.json": JSON.stringify({
        model: "opus",
        attribution: hidden,
      }),
      [noAttributionRule]:
        "<!-- @reference @auaust/engrenage/agents/rules/no-attribution.md -->\n<!-- @end -->\n",
    });

    (await sync(project.root)).filesystem.flush();

    const settings = JSON.parse(project.read(".claude/settings.json"));

    expect(settings).toMatchObject({
      model: "opus",
    });

    expect(settings).not.toHaveProperty("attribution");
    expect(existsSync(project.resolve(noAttributionRule))).toBe(false);
    expect(project.read(attributionRule)).toContain("Attribution");

    const custom = { commit: "Co-Authored-By: Agent", pr: "" };

    (await loadConfig(project.root)).filesystem.write(
      ".claude/settings.json",
      JSON.stringify({ attribution: custom }),
    );

    (await sync(project.root)).filesystem.flush();

    expect(JSON.parse(project.read(".claude/settings.json"))).toMatchObject({
      attribution: custom,
    });
  });

  test("unset leaves settings and rule files as they are", async () => {
    const files = {
      ".claude/settings.json": JSON.stringify({
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
        },
        attribution: hidden,
      }),
      [noAttributionRule]:
        "<!-- @reference @auaust/engrenage/agents/rules/no-attribution.md -->\n<!-- @end -->\n",
      [attributionRule]: "Project attribution note.\n",
    };

    const project = createProject("", files);

    const config = await sync(project.root);

    config.filesystem.flush();

    expect(project.read(".claude/settings.json")).toBe(
      files[".claude/settings.json"],
    );

    expect(project.read(attributionRule)).toBe(files[attributionRule]);
    expect(existsSync(project.resolve(noAttributionRule))).toBe(true);
  });
});
