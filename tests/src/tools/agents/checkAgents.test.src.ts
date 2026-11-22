import { afterEach, expect, test, vi } from "vitest";

import { spawnProcess } from "#foundation/processes/index";
import { loadConfig } from "#project/config/operations/loadConfig";
import { formatChanges } from "#project/sync/index";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { linkPrettier } from "#tests/utils/linkPrettier";
import { addAgentSkills } from "#tools/agents/index";
import { checkAgents } from "#tools/agents/operations/checkAgents";
import { syncClaudeSettings } from "#tools/metalbrain/claude/index";

vi.mock("#foundation/processes/operations/spawnProcess", async () => {
  const {
    resolveClaudeVersion,
  } = await import("#tests/utils/resolveClaudeVersion");

  return { spawnProcess: vi.fn(resolveClaudeVersion) };
});

afterEach(() => {
  vi.clearAllMocks();
});

async function fixture(skills: readonly string[] = ["implement"]) {
  const project = createTemporaryProject({
    "package.json": '{"type":"module","repository":"github:acme/consumer","devDependencies":{"prettier":"*"}}',
    "engrenage.config.ts": 'export default { agents: { preferred: ["claude"] } };',
    "AGENTS.md": "Instructions\n",
    "CLAUDE.md": "@AGENTS.md\n",
    ".claude/settings.json": "{}\n",
  });

  linkPrettier(project.resolve("node_modules/prettier"));

  const config = await loadConfig(project.root);

  await addAgentSkills(config, skills);

  await syncClaudeSettings(config);

  await formatChanges(config);

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
        message: expect.stringContaining("2.1.318"),
      }),
      expect.objectContaining({
        status: "runtime-unverified",
        message: expect.stringContaining("user/system"),
      }),
    ]),
  );

  expect(config.context.filesystem.changes()).toEqual([]);
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
    stdout: "2.1.400 (Claude Code)",
    stderr: "",
    error: undefined,
    signal: null,
  });

  expect(await checkAgents(config)).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        status: "runtime-unverified",
        message: expect.stringContaining("2.1.400"),
      }),
    ]),
  );
});

test("recognizes inspected Claude capabilities while leaving effective overrides unverified", async () => {
  const project = createTemporaryProject({
    "package.json": '{"type":"module","repository":"github:acme/consumer"}',
    "engrenage.config.ts": 'export default { agents: { preferred: ["claude"] } };',
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

test("reports a missing installed skill when its agent file remains", async () => {
  const config = await fixture();

  await config.context.filesystem.remove(".claude/skills/implement/SKILL.md");

  expect(await checkAgents(config)).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        status: "conflicting",
        message: expect.stringContaining(".claude/skills/implement/SKILL.md"),
      }),
    ]),
  );
});

test("accepts a skill whose rendered table sync formats", async () => {
  const config = await fixture(["walking"]);

  const findings = await checkAgents(config);

  expect(findings).toContainEqual(
    expect.objectContaining({
      status: "configured",
      message: expect.stringContaining(".claude/skills/walking/SKILL.md"),
    }),
  );
});
