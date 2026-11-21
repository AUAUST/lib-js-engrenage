import { RequestError } from "@octokit/request-error";
import { afterEach, beforeEach, expect, test, vi } from "vitest";

import { loadConfig } from "#project/config/operations/loadConfig";
import { createCheckout } from "#tests/utils/createCheckout";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { createTestReporter } from "#tests/utils/createTestReporter";
import { resolveCodexProfile } from "#tools/agents/codex/index";
import { addAgentSkills } from "#tools/agents/index";
import { checkIssue } from "#tools/github/issues/contract/operations/checkIssue";
import { findBriefedIssue } from "#tools/github/issues/contract/utils/findBriefedIssue";
import { runContext } from "#workflows/cli/operations/runContext";

import dispatch from "#bin/engrenage-hook/claude/actions/dispatch";
import codexDispatch from "#bin/engrenage-hook/codex/actions/dispatch";

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

let payload: unknown;

function runCheck(check: (payload: unknown) => Promise<boolean>) {
  return runContext.run(
    { signal: new AbortController().signal, reporter: createTestReporter() },
    () => check(payload),
  );
}

beforeEach(() => {
  vi.spyOn(process.stdout, "write").mockReturnValue(true);
  vi.mocked(checkIssue).mockClear();
});

afterEach(() => {
  vi.restoreAllMocks();
});

test.each(["Context\nIssue: o/r#1", "Context\nDraft: /x.draft.md"])(
  "denies a brief naming its issue or draft past the first line: %s",
  async (prompt) => {
    payload = {
      cwd: process.cwd(),
      tool_input: { subagent_type: "worker", prompt },
    };

    await runCheck(dispatch);

    expect(process.stdout.write).toHaveBeenCalledWith(
      expect.stringMatching(
        /move the `(?:Issue|Draft):` line to the first line/,
      ),
    );

    expect(checkIssue).not.toHaveBeenCalled();
  },
);

test("accepts a first-line CRLF brief and bare requests", async () => {
  expect(findBriefedIssue("Issue: o/r#1\r\nContext")).toEqual({
    repository: "o/r",
    number: 1,
  });

  payload = {
    cwd: process.cwd(),
    tool_input: {
      subagent_type: "worker",
      prompt: "Issue: o/r#1\r\nContext",
    },
  };

  await runCheck(dispatch);

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

  payload = {
    cwd: process.cwd(),
    tool_input: {
      subagent_type: "debugger",
      prompt: "A direct user failure",
    },
  };

  await runCheck(dispatch);

  payload = {
    cwd: process.cwd(),
    tool_input: {
      subagent_type: "worker",
      prompt: "implement it",
    },
  };

  await runCheck(dispatch);

  expect(checkIssue).toHaveBeenCalledTimes(1);
  expect(process.stdout.write).not.toHaveBeenCalled();
});

test("denies a brief whose issue cannot be read, naming the registered repositories on a 404", async () => {
  vi.mocked(checkIssue)
    .mockRejectedValueOnce(
      new RequestError("Not Found", 404, {
        request: {
          method: "GET",
          url: "https://api.github.com",
          headers: {},
        },
      }),
    )
    .mockRejectedValueOnce(new Error("token missing"));

  payload = {
    cwd: process.cwd(),
    tool_input: { subagent_type: "worker", prompt: "Issue: o/r#1\nContext" },
  };

  await runCheck(dispatch);

  await runCheck(dispatch);

  expect(process.stdout.write).toHaveBeenNthCalledWith(
    1,
    expect.stringMatching(
      /o\/r#1 could not be checked for a worker: Not Found; `o\/r` is not a registered repository: /,
    ),
  );

  expect(process.stdout.write).toHaveBeenNthCalledWith(
    2,
    expect.stringMatching(/"permissionDecision":"deny".*token missing"/),
  );
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

  await addAgentSkills(config, ["implement", "debugging"]);

  return {
    project,
    config,
    filesystem: config.context.filesystem,
  };
}

test.each(["worker", "debugger", "debugger_low", "debugger_high"])(
  "maps exact generated profile %s",
  async (name) => {
    const { project, filesystem } = await installed();

    await filesystem.flush();

    payload = {
      cwd: project.root,
      tool_name: "spawn_agent",
      tool_input: {
        agent_type: name,
        message: "Issue: o/r#1\nContext",
      },
    };

    await runCheck(codexDispatch);

    expect(checkIssue).toHaveBeenCalledWith(
      expect.anything(),
      1,
      name.startsWith("worker") ? "worker" : "debugger",
      { dispatch: true, checkouts: [] },
    );
  },
);

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

  payload = {
    cwd: project.root,
    tool_name: "spawn_agent",
    tool_input: {
      agent_type: "worker",
      message: "Issue: o/r#1\nContext",
    },
  };

  await runCheck(codexDispatch);

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

test("checks a first-line draft of the checkout, denying its findings or another path", async () => {
  const { project, filesystem } = await installed("{}", {
    ".engrenage/github.json": '{"repositories":{},"organizations":{}}',
    ".ai/issues/new-x.draft.md": "## Goal\n\ng\n",
  });

  await filesystem.flush();

  for (const path of [".ai/issues/new-x.draft.md", "new-x.draft.md"]) {
    payload = {
      cwd: project.root,
      tool_name: "spawn_agent",
      tool_input: {
        agent_type: "worker",
        message: `Draft: ${project.resolve(path)}\nContext`,
      },
    };

    await runCheck(codexDispatch);
  }

  expect(process.stdout.write).toHaveBeenNthCalledWith(
    1,
    expect.stringContaining("The draft has no manifest"),
  );

  expect(process.stdout.write).toHaveBeenNthCalledWith(
    2,
    expect.stringContaining("is not a draft of this checkout"),
  );

  expect(checkIssue).not.toHaveBeenCalled();
});

test("rejects missing/conflicting generated output and ignores unowned custom names", async () => {
  const { config, filesystem } = await installed();

  await filesystem.remove(".codex/agents/debugger_low.toml");

  await expect(resolveCodexProfile(config, "debugger_low")).rejects.toThrow(
    ".codex/agents/debugger_low.toml",
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
