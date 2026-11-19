import { afterEach, beforeEach, expect, test, vi } from "vitest";

import { loadConfig } from "#project/config/operations/loadConfig";
import { createCheckout } from "#tests/utils/createCheckout";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { runDefinition } from "#tests/utils/runDefinition";
import { resolveCodexProfile } from "#tools/agents/codex/index";
import { addAgentSkills } from "#tools/agents/index";
import { readHookPayload } from "#tools/agents/operations/readHookPayload";
import { checkIssue } from "#tools/github/issues/contract/operations/checkIssue";
import { findBriefedIssue } from "#tools/github/issues/contract/utils/findBriefedIssue";

import dispatch from "#bin/engrenage/agents/claude/hook/dispatch";
import codexDispatch from "#bin/engrenage/agents/codex/hook/dispatch";

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

    await runDefinition(dispatch);

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
    tool_input: {
      subagent_type: "worker",
      prompt: "Issue: o/r#1\r\nContext",
    },
  });

  await runDefinition(dispatch);

  expect(checkIssue).toHaveBeenCalledWith(
    {
      repository: "o/r",
      client: expect.anything(),
      contractNames: expect.anything(),
    },
    1,
    "worker",
    {
      dispatch: true,
      checkouts: [
        {
          repository: expect.any(String),
          root: process.cwd(),
          ref: "HEAD",
        },
      ],
    },
  );

  vi.mocked(readHookPayload).mockResolvedValue({
    tool_input: {
      subagent_type: "debugger",
      prompt: "A direct user failure",
    },
  });

  await runDefinition(dispatch);

  expect(checkIssue).toHaveBeenCalledTimes(1);
  expect(process.stdout.write).not.toHaveBeenCalled();
});

async function installed(
  github = "{}",
  files: Readonly<Record<string, string>> = {},
) {
  const project = createTemporaryProject({
    "package.json": '{"type":"module","repository":"github:acme/consumer"}',
    "engrenage.config.ts": `export default { agents: { preferred: ["codex"] }, github: ${github} };`,
    ...files,
  });

  const config = await loadConfig(project.root);

  await addAgentSkills(config, ["issue-implementation", "debugging"]);

  return {
    project,
    config,
    filesystem: config.context.filesystem,
  };
}

test.each([
  "worker",
  "worker_medium",
  "debugger",
  "debugger_low",
  "debugger_high",
])("maps exact generated profile %s", async (name) => {
  const { project, filesystem } = await installed();

  await filesystem.flush();

  vi.mocked(readHookPayload).mockResolvedValue({
    cwd: project.root,
    tool_name: "spawn_agent",
    tool_input: {
      agent_type: name,
      message: "Issue: o/r#1\nContext",
    },
  });

  await runDefinition(codexDispatch);

  expect(checkIssue).toHaveBeenCalledWith(
    expect.anything(),
    1,
    name.startsWith("worker") ? "worker" : "debugger",
    { dispatch: true, checkouts: [] },
  );
});

test("passes the checkouts the project links with the local one", async () => {
  const checkout = createCheckout("acme/tool");

  const {
    project,
    filesystem,
  } = await installed('{ repositories: { tool: "acme/tool" } }', {
    ".engrenage/links.json": JSON.stringify({
      tool: {
        package: "tool",
        directory: checkout.root,
        installed: "../.pnpm/tool",
      },
    }),
  });

  await filesystem.flush();

  vi.mocked(readHookPayload).mockResolvedValue({
    cwd: project.root,
    tool_name: "spawn_agent",
    tool_input: {
      agent_type: "worker",
      message: "Issue: o/r#1\nContext",
    },
  });

  await runDefinition(codexDispatch);

  expect(checkIssue).toHaveBeenCalledWith(expect.anything(), 1, "worker", {
    dispatch: true,
    checkouts: [
      {
        repository: "acme/tool",
        root: checkout.root,
        ref: "HEAD",
      },
    ],
  });
});

test("rejects missing/conflicting generated output and ignores unowned custom names", async () => {
  const { config, filesystem } = await installed();

  await filesystem.remove(".codex/agents/worker_medium.toml");

  await expect(resolveCodexProfile(config, "worker_medium")).rejects.toThrow(
    ".codex/agents/worker_medium.toml",
  );

  await filesystem.write(".codex/agents/worker.toml", 'name = "mine"');

  await expect(resolveCodexProfile(config, "worker")).rejects.toThrow(
    ".codex/agents/worker.toml",
  );

  await filesystem.remove(".agents/skills/debugging/SKILL.md");

  await expect(resolveCodexProfile(config, "debugger")).rejects.toThrow(
    ".agents/skills/debugging/SKILL.md",
  );

  await expect(
    resolveCodexProfile(config, "worker_custom"),
  ).resolves.toBeUndefined();
});
