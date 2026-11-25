import { RequestError } from "@octokit/request-error";
import { beforeEach, expect, test, vi } from "vitest";

import { loadConfig } from "#project/config/operations/loadConfig";
import { createCheckout } from "#tests/utils/createCheckout";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { checkIssue } from "#tools/github/issues/contract/operations/checkIssue";
import { findBriefedIssue } from "#tools/github/issues/contract/utils/findBriefedIssue";
import { guardClaudeDispatch } from "#tools/metalbrain/operations/guardClaudeDispatch";

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

function guard(cwd: string, agent: string, prompt: string) {
  return guardClaudeDispatch({
    cwd,
    tool_input: { subagent_type: agent, prompt },
  });
}

function denial(reason: string | RegExp) {
  return {
    decision: "deny",
    reason: expect.stringMatching(reason),
  };
}

beforeEach(() => {
  vi.mocked(checkIssue).mockClear();
});

test.each(["Context\nIssue: o/r#1", "Context\nDraft: /x.draft.md"])(
  "denies a brief naming its issue or draft past the first line: %s",
  async (prompt) => {
    await expect(guard(process.cwd(), "worker", prompt)).resolves.toEqual(
      denial(/move the `(?:Issue|Draft):` line to the first line/),
    );

    expect(checkIssue).not.toHaveBeenCalled();
  },
);

test("accepts a first-line CRLF brief and bare requests", async () => {
  expect(findBriefedIssue("Issue: o/r#1\r\nContext")).toEqual({
    repository: "o/r",
    number: 1,
  });

  for (const [agent, prompt] of [
    ["worker", "Issue: o/r#1\r\nContext"],
    ["debugger", "A direct user failure"],
    ["worker", "implement it"],
  ] as const) {
    await expect(guard(process.cwd(), agent, prompt)).resolves.toBeUndefined();
  }

  expect(checkIssue).toHaveBeenCalledTimes(1);

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

  await expect(
    guard(process.cwd(), "worker", "Issue: o/r#1\nContext"),
  ).resolves.toEqual(
    denial(
      /o\/r#1 could not be checked for a worker: Not Found; `o\/r` is not a registered repository: /,
    ),
  );

  await expect(
    guard(process.cwd(), "worker", "Issue: o/r#1\nContext"),
  ).resolves.toEqual(denial("token missing"));
});

async function installed(
  github = "{}",
  files: Readonly<Record<string, string>> = {},
) {
  const project = createTemporaryProject({
    "package.json": '{"type":"module","repository":"github:acme/consumer"}',
    "engrenage.config.ts": `export default { agents: { preferred: ["claude"] }, github: ${github} };`,
    ...files,
  });

  const config = await loadConfig(project.root);

  return {
    project,
    filesystem: config.context.filesystem,
  };
}

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

  await guard(project.root, "worker", "Issue: o/r#1\nContext");

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
    ".ai/issues/new-x.draft.md": "## Compass\n\ng\n",
  });

  await filesystem.flush();

  await expect(
    guard(
      project.root,
      "worker",
      `Draft: ${project.resolve(".ai/issues/new-x.draft.md")}\nContext`,
    ),
  ).resolves.toEqual(denial("The draft has no manifest"));

  await expect(
    guard(
      project.root,
      "worker",
      `Draft: ${project.resolve("new-x.draft.md")}\nContext`,
    ),
  ).resolves.toEqual(denial("is not a draft of this checkout"));

  expect(checkIssue).not.toHaveBeenCalled();
});
