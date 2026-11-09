import { afterEach, expect, test, vi } from "vitest";

import { spawnProcess } from "#foundation/processes/index";
import { loadConfig } from "#project/config/operations/loadConfig";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { syncClaudeSettings } from "#tools/agents/claude/index";
import { syncCodexFiles } from "#tools/agents/codex/index";
import { addAgentSkills } from "#tools/agents/operations/addAgentSkills";
import { checkAgents } from "#tools/agents/operations/checkAgents";

vi.mock("#foundation/processes/operations/spawnProcess", () => {
  return {
    spawnProcess: vi.fn(() =>
      Promise.resolve({
        status: 0,
        stdout: "codex-cli 0.159.2\n",
        stderr: "",
        error: undefined,
        signal: null,
      }),
    ),
  };
});

afterEach(() => {
  vi.clearAllMocks();
});

async function fixture() {
  const project = createTemporaryProject({
    "package.json": '{"type":"module"}',
    "engrenage.config.ts":
      'export default { agents: { preferred: ["codex"], codexHooks: true } };',
    "AGENTS.md": "Instructions\n",
    "AGENTS.override.md": "<!-- @rules -->\n<!-- @end -->\n",
  });

  const config = await loadConfig(project.root);

  await addAgentSkills(
    {
      filesystem: config.context.filesystem,
      agents: await config.resolve("agents"),
    },
    ["issue-implementation"],
  );

  await syncCodexFiles(config);

  await config.context.filesystem.flush();

  return config;
}

test("reports generated configuration without asserting runtime trust or changing files", async () => {
  const config = await fixture();

  const findings = await checkAgents(config);

  expect(findings.some(({ status }) => status === "conflicting")).toBe(false);

  expect(findings).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        status: "configured",
        message: expect.stringContaining("0.159.2"),
      }),
      expect.objectContaining({
        status: "runtime-unverified",
        message: expect.stringContaining("/hooks"),
      }),
    ]),
  );

  expect(config.context.filesystem.changes()).toEqual([]);
});

test("reports missing profiles, disabled hooks and duplicate hook representations", async () => {
  const config = await fixture();

  const filesystem = config.context.filesystem;

  await filesystem.remove(".codex/agents/worker_high.toml");

  await filesystem.write(
    ".codex/config.toml",
    "[features]\nhooks = false\n[hooks]\nPreToolUse = []\n",
  );

  const findings = await checkAgents(config);

  expect(findings).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        status: "conflicting",
        message: expect.stringContaining("worker_high.toml"),
      }),
      expect.objectContaining({
        status: "disabled",
        message: expect.stringContaining("features.hooks"),
      }),
      expect.objectContaining({
        status: "conflicting",
        message: expect.stringContaining("inline"),
      }),
    ]),
  );
});

test("distinguishes an unavailable client from another unverified version", async () => {
  const config = await fixture();

  vi.mocked(spawnProcess).mockResolvedValueOnce({
    status: null,
    stdout: "",
    stderr: "",
    error: new Error("ENOENT"),
    signal: null,
  });

  expect(await checkAgents(config)).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        status: "unsupported",
        message: expect.stringContaining("unavailable"),
      }),
    ]),
  );

  vi.mocked(spawnProcess).mockResolvedValueOnce({
    status: 0,
    stdout: "codex-cli 0.160.0",
    stderr: "",
    error: undefined,
    signal: null,
  });

  expect(await checkAgents(config)).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        status: "runtime-unverified",
        message: expect.stringContaining("0.160.0"),
      }),
    ]),
  );
});

test("recognizes inspected Claude capabilities while leaving effective overrides unverified", async () => {
  const project = createTemporaryProject({
    "package.json": '{"type":"module"}',
    "engrenage.config.ts":
      'export default { agents: { preferred: ["claude"] } };',
    "AGENTS.md": "Instructions",
    "CLAUDE.md": "@AGENTS.md",
    ".claude/settings.json": '{"disableAllHooks":true}',
  });

  const config = await loadConfig(project.root);

  await syncClaudeSettings(config);

  vi.mocked(spawnProcess).mockResolvedValueOnce({
    status: 0,
    stdout: "2.1.318 (Claude Code)",
    stderr: "",
    error: undefined,
    signal: null,
  });

  const findings = await checkAgents(config);

  expect(findings).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        status: "configured",
        message: expect.stringContaining("2.1.318"),
      }),
      expect.objectContaining({
        status: "disabled",
        message: expect.stringContaining("disableAllHooks"),
      }),
      expect.objectContaining({
        status: "runtime-unverified",
        message: expect.stringContaining("user/system"),
      }),
    ]),
  );
});

test("reports a missing installed skill when its owned profiles remain", async () => {
  const config = await fixture();

  await config.context.filesystem.remove(
    ".agents/skills/issue-implementation/SKILL.md",
  );

  expect(await checkAgents(config)).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        status: "conflicting",
        message: expect.stringContaining(
          ".agents/skills/issue-implementation/SKILL.md",
        ),
      }),
    ]),
  );
});
