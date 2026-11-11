import { afterEach, beforeEach, expect, test, vi } from "vitest";

import { loadConfig } from "#project/config/operations/loadConfig";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { resolveCodexProfile } from "#tools/agents/codex/index";
import { addAgentSkills } from "#tools/agents/operations/addAgentSkills";
import { readHookPayload } from "#tools/agents/operations/readHookPayload";
import { checkIssue } from "#tools/github/issues/contract/operations/checkIssue";
import { findBriefedIssue } from "#tools/github/issues/contract/utils/findBriefedIssue";

import * as definitions from "#tools/agents/operations/getSkillDefinitions";

import dispatch from "#bin/engrenage/agents/claude/hook/actions/dispatch";
import codexDispatch from "#bin/engrenage/agents/codex/hook/actions/dispatch";

vi.mock("#tools/agents/operations/readHookPayload", () => {
  return {
    readHookPayload: vi.fn(),
  };
});

vi.mock("#tools/github/issues/contract/operations/checkIssue", () => {
  return {
    checkIssue: vi.fn(() => {
      return Promise.resolve({
        findings: [],
        subIssues: [],
        blockedBy: [],
        towards: [],
      });
    }),
  };
});

vi.mock("#tools/github/issues/api/operations/resolveGithubToken", () => {
  return {
    resolveGithubToken: vi.fn(() => Promise.resolve("token")),
  };
});

beforeEach(() => {
  vi.spyOn(process.stdout, "write").mockReturnValue(true);
  vi.mocked(checkIssue).mockClear();
});

afterEach(() => {
  vi.restoreAllMocks();
});

test.each(["implement it", "Context\nIssue: o/r#1"])(
  "denies a worker without a first-line Issue: %s",
  async (prompt) => {
    vi.mocked(readHookPayload).mockResolvedValue({
      tool_input: { subagent_type: "worker", prompt },
    });

    await dispatch();

    expect(process.stdout.write).toHaveBeenCalledWith(
      expect.stringContaining(
        "brief a worker with `Issue: <owner>/<repo>#<n>`",
      ),
    );

    expect(checkIssue).not.toHaveBeenCalled();
  },
);

test("accepts a first-line CRLF brief and direct debugger reports", async () => {
  expect(findBriefedIssue("Issue: o/r#1\r\nContext")).toEqual({
    repository: "o/r",
    number: 1,
  });

  vi.mocked(readHookPayload).mockResolvedValue({
    tool_input: { subagent_type: "worker", prompt: "Issue: o/r#1\r\nContext" },
  });

  await dispatch();

  expect(checkIssue).toHaveBeenCalledWith(
    { repository: "o/r", token: "token" },
    1,
    "worker",
    { dispatch: true, root: process.cwd() },
  );

  vi.mocked(readHookPayload).mockResolvedValue({
    tool_input: { subagent_type: "debugger", prompt: "A direct user failure" },
  });

  await dispatch();

  expect(checkIssue).toHaveBeenCalledTimes(1);
  expect(process.stdout.write).not.toHaveBeenCalled();
});

async function installed() {
  const project = createTemporaryProject({
    "package.json": '{"type":"module"}',
    "engrenage.config.ts": 'export default { agents: { preferred: ["codex"] } };',
  });

  const config = await loadConfig(project.root);

  await addAgentSkills(
    {
      filesystem: config.context.filesystem,
      agents: await config.resolve("agents"),
    },
    ["issue-implementation", "debugging"],
  );

  return {
    project,
    config,
    filesystem: config.context.filesystem,
  };
}

test.each([
  "worker",
  "worker_low",
  "worker_high",
  "debugger",
  "debugger_low",
  "debugger_high",
])("maps exact generated profile %s", async (name) => {
  const { project, filesystem } = await installed();

  await filesystem.flush();

  vi.mocked(readHookPayload).mockResolvedValue({
    cwd: project.root,
    tool_name: "spawn_agent",
    tool_input: { agent_type: name, message: "Issue: o/r#1\nContext" },
  });

  await codexDispatch();

  expect(checkIssue).toHaveBeenCalledWith(
    expect.anything(),
    1,
    name.startsWith("worker") ? "worker" : "debugger",
    { dispatch: true, root: project.root },
  );
});

test("rejects missing/conflicting generated output and ignores unowned custom names", async () => {
  const { filesystem } = await installed();

  await filesystem.remove(".codex/agents/worker_high.toml");

  await expect(resolveCodexProfile(filesystem, "worker_high")).rejects.toThrow(
    ".codex/agents/worker_high.toml",
  );

  await filesystem.write(".codex/agents/worker.toml", 'name = "mine"');

  await expect(resolveCodexProfile(filesystem, "worker")).rejects.toThrow(
    ".codex/agents/worker.toml",
  );

  await filesystem.remove(".agents/skills/debugging/SKILL.md");

  await expect(resolveCodexProfile(filesystem, "debugger")).rejects.toThrow(
    ".agents/skills/debugging/SKILL.md",
  );

  await expect(
    resolveCodexProfile(filesystem, "worker_custom"),
  ).resolves.toBeUndefined();
});

test("rejects an unsupported canonical gated role from exact metadata", async () => {
  const { filesystem } = await installed();

  const templates = await definitions.getSkillDefinitions();

  const template = templates.find(({ agent }) => agent?.name === "worker");

  if (template?.agent === undefined) {
    throw new Error("Worker template missing");
  }

  vi.spyOn(definitions, "getSkillDefinitions").mockResolvedValue([
    {
      ...template,
      agent: {
        ...template.agent,
        name: "custom",
        gate: true,
      },
    },
  ]);

  await expect(resolveCodexProfile(filesystem, "custom_high")).rejects.toThrow(
    "Unsupported canonical gated Codex role custom",
  );
});
