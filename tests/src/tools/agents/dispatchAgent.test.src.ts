import { chmodSync } from "node:fs";
import { delimiter, join } from "node:path";

import { describe, expect, test } from "vitest";

import { createProjectConfig } from "#project/config/index";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { dispatchClaudeAgent } from "#tools/agents/claude/adapters/dispatchClaudeAgent";
import { dispatchCodexAgent } from "#tools/agents/codex/adapters/dispatchCodexAgent";
import { dispatchAgent } from "#tools/agents/operations/dispatchAgent";
import { createDispatchEnvironment } from "#tools/agents/utils/createDispatchEnvironment";

function createClient(name: string, output: string) {
  const project = createTemporaryProject();

  project.write(
    `bin/${name}`,
    `#!/usr/bin/env node
const { readFileSync, writeFileSync } = require("node:fs");
writeFileSync(${JSON.stringify(project.resolve("call.json"))}, JSON.stringify({
  args: process.argv.slice(2),
  cwd: process.cwd(),
  input: readFileSync(0, "utf-8"),
  session: process.env.CLAUDE_CODE_SESSION_ID ?? null,
}));
process.stdout.write(${JSON.stringify(output)});
`,
  );

  chmodSync(project.resolve(`bin/${name}`), 0o755);

  return {
    environment: {
      PATH: [project.resolve("bin"), process.env.PATH].join(delimiter),
    },
    call(): { args: string[]; cwd: string; input: string } {
      return JSON.parse(project.read("call.json"));
    },
  };
}

describe("dispatchClaudeAgent", () => {
  test("runs the agent headless in the checkout and reads its report, session and denials", async () => {
    const checkout = createTemporaryProject();

    const client = createClient(
      "claude",
      JSON.stringify({
        type: "result",
        subtype: "success",
        is_error: false,
        session_id: "session-1",
        result: "Done.",
        permission_denials: [{ tool_name: "Bash" }, { tool_name: "Bash" }],
      }),
    );

    await expect(
      dispatchClaudeAgent({
        directory: checkout.root,
        run: { agent: "worker" },
        brief: "Issue: AUAUST/repo#1",
        effort: "high",
        environment: client.environment,
      }),
    ).resolves.toEqual({
      session: "session-1",
      report: "Done.",
      succeeded: true,
      denied: ["Bash"],
    });

    expect(client.call()).toEqual({
      args: [
        "--print",
        "--agent",
        "worker",
        "--effort",
        "high",
        "--output-format",
        "json",
        "--permission-prompts",
        "none",
      ],
      cwd: checkout.root,
      input: "Issue: AUAUST/repo#1",
      session: null,
    });
  });

  test("fails clearly when the client prints no result", async () => {
    const checkout = createTemporaryProject();

    const client = createClient("claude", "--agent 'nope' not found");

    await expect(
      dispatchClaudeAgent({
        directory: checkout.root,
        run: { session: "session-1" },
        brief: "Continue.",
        effort: undefined,
        environment: client.environment,
      }),
    ).rejects.toThrow("without a result");

    expect(client.call().args.slice(0, 3)).toEqual([
      "--print",
      "--resume",
      "session-1",
    ]);
  });
});

describe("dispatchCodexAgent", () => {
  test("starts the checkout's own Codex profile and reads the last agent message", async () => {
    const checkout = createTemporaryProject({
      ".codex/agents/worker.toml": 'name = "worker"\nmodel_reasoning_effort = "low"\ndeveloper_instructions = "Follow the worker skill."\n',
    });

    const client = createClient(
      "codex",
      [
        {
          type: "thread.started",
          thread_id: "thread-1",
        },
        {
          type: "item.completed",
          item: { type: "agent_message", text: "First." },
        },
        {
          type: "item.completed",
          item: { type: "agent_message", text: "Final report." },
        },
        {
          type: "turn.completed",
          usage: {},
        },
      ]
        .map((event) => JSON.stringify(event))
        .join("\n"),
    );

    await expect(
      dispatchCodexAgent({
        directory: checkout.root,
        run: { agent: "worker" },
        brief: "Issue: AUAUST/repo#1",
        effort: undefined,
        environment: client.environment,
      }),
    ).resolves.toEqual({
      session: "thread-1",
      report: "Final report.",
      succeeded: true,
      denied: [],
    });

    expect(client.call()).toMatchObject({
      args: [
        "exec",
        "--json",
        "--config",
        'developer_instructions="Follow the worker skill."',
        "--config",
        'model_reasoning_effort="low"',
        "-",
      ],
      cwd: checkout.root,
      input: "Issue: AUAUST/repo#1",
    });
  });

  test("refuses an agent the checkout defines no Codex profile for", async () => {
    const checkout = createTemporaryProject();

    await expect(
      dispatchCodexAgent({
        directory: checkout.root,
        run: { agent: "worker" },
        brief: "Brief",
        effort: undefined,
        environment: {},
      }),
    ).rejects.toThrow(`defines no Codex agent worker`);
  });
});

describe("createDispatchEnvironment", () => {
  test("drops what the caller's client and pnpm set, keeping the user's configuration", () => {
    const binaries = join("/caller", "node_modules", ".bin");

    expect(
      createDispatchEnvironment({
        PATH: [binaries, "/usr/bin"].join(delimiter),
        HOME: "/home/user",
        ANTHROPIC_BASE_URL: "https://example.test",
        CLAUDECODE: "1",
        CLAUDE_CODE_SESSION_ID: "caller",
        CLAUDE_EFFORT: "medium",
        CLAUDE_CONFIG_DIR: "/config",
        CODEX_THREAD_ID: "caller",
        CODEX_HOME: "/codex",
        INIT_CWD: "/caller",
        PNPM_PACKAGE_NAME: "caller",
        PNPM_HOME: "/pnpm",
        npm_config_user_agent: "pnpm",
        pnpm_config_verify_deps_before_run: "false",
      }),
    ).toEqual({
      PATH: "/usr/bin",
      HOME: "/home/user",
      ANTHROPIC_BASE_URL: "https://example.test",
      CLAUDE_CONFIG_DIR: "/config",
      CODEX_HOME: "/codex",
      PNPM_HOME: "/pnpm",
    });
  });
});

describe("dispatchAgent", () => {
  test("refuses a worker brief naming no issue before running anything", async () => {
    const caller = createTemporaryProject();
    const checkout = createTemporaryProject();

    const config = createProjectConfig({
      root: caller.root,
      raw: {
        agents: { preferred: ["claude"] },
      },
      configFile: undefined,
    });

    await expect(
      dispatchAgent(config, {
        directory: checkout.root,
        run: { agent: "worker" },
        brief: "Do the thing.",
        effort: undefined,
      }),
    ).rejects.toThrow("brief a worker with `Issue: <owner>/<repo>#<n>`");
  });
});
