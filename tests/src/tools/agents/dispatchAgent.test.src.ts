import { chmodSync } from "node:fs";
import { delimiter, join } from "node:path";

import { describe, expect, test } from "vitest";

import { createDispatchEnvironment } from "#metalbrain/runtimes/utils/createDispatchEnvironment";
import { createProjectConfig } from "#project/config/index";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { dispatchClaudeAgent } from "#tools/agents/claude/adapters/dispatchClaudeAgent";
import { dispatchAgent } from "#tools/metalbrain/operations/dispatchAgent";
import { removePnpmRunEnvironment } from "#tools/pnpm/index";

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

describe("createDispatchEnvironment", () => {
  test("drops what the caller's client and pnpm set, keeping the user's configuration", () => {
    const binaries = join("/caller", "node_modules", ".bin");

    expect(
      createDispatchEnvironment(
        {
          PATH: [binaries, "/usr/bin"].join(delimiter),
          HOME: "/home/user",
          ANTHROPIC_BASE_URL: "https://example.test",
          CLAUDECODE: "1",
          CLAUDE_CODE_SESSION_ID: "caller",
          CLAUDE_EFFORT: "medium",
          CLAUDE_CONFIG_DIR: "/config",
          INIT_CWD: "/caller",
          PNPM_PACKAGE_NAME: "caller",
          PNPM_HOME: "/pnpm",
          npm_config_user_agent: "pnpm",
          pnpm_config_verify_deps_before_run: "false",
        },
        removePnpmRunEnvironment,
      ),
    ).toEqual({
      PATH: "/usr/bin",
      HOME: "/home/user",
      ANTHROPIC_BASE_URL: "https://example.test",
      CLAUDE_CONFIG_DIR: "/config",
      PNPM_HOME: "/pnpm",
    });
  });
});

describe("dispatchAgent", () => {
  test("runs the named client whatever agents.preferred lists, refusing a brief naming its issue past the first line before running anything", async () => {
    const caller = createTemporaryProject();
    const checkout = createTemporaryProject();

    const config = createProjectConfig({
      root: caller.root,
      raw: {
        agents: { preferred: [] },
      },
      configFile: undefined,
    });

    await expect(
      dispatchAgent(config, "claude", {
        directory: checkout.root,
        run: { agent: "worker" },
        brief: "Do the thing.\nIssue: AUAUST/repo#1",
        effort: undefined,
      }),
    ).rejects.toThrow("move the `Issue:` line to the first line");
  });

  test("refuses a client no active extension contributes, naming the runtimes it accepts", async () => {
    const caller = createTemporaryProject();
    const checkout = createTemporaryProject();

    const config = createProjectConfig({
      root: caller.root,
      raw: {},
      configFile: undefined,
    });

    await expect(
      dispatchAgent(config, "gemini", {
        directory: checkout.root,
        run: { agent: "worker" },
        brief: "Issue: AUAUST/repo#1",
        effort: undefined,
      }),
    ).rejects.toThrow(
      "No active extension contributes the gemini agent runtime; expected one of: claude",
    );
  });
});
