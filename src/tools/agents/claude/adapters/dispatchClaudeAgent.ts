import {
  array,
  boolean,
  looseObject,
  optional,
  safeParse,
  string,
} from "valibot";

import { spawnProcess } from "#foundation/processes/index";
import { claudeBinary } from "#metalbrain/runtimes/constants";
import type { AgentDispatch, AgentReport } from "#metalbrain/runtimes/index";

const resultSchema = looseObject({
  session_id: string(),
  is_error: boolean(),
  subtype: string(),
  result: optional(string()),
  errors: optional(array(string())),
  permission_denials: optional(array(looseObject({ tool_name: string() })), []),
});

function parseResult(stdout: string) {
  try {
    const parsed = safeParse(resultSchema, JSON.parse(stdout));

    return parsed.success ? parsed.output : undefined;
  } catch {
    return;
  }
}

export async function dispatchClaudeAgent({
  directory,
  run,
  brief,
  effort,
  environment,
}: AgentDispatch): Promise<AgentReport> {
  const args = [
    "--print",
    ...("agent" in run ? ["--agent", run.agent] : ["--resume", run.session]),
    ...(effort === undefined ? [] : ["--effort", effort]),
    "--output-format",
    "json",
    "--permission-prompts",
    "none",
  ];

  const {
    status,
    signal,
    stdout,
    error,
  } = await spawnProcess(claudeBinary, args, {
    cwd: directory,
    env: environment,
    stdio: ["pipe", "pipe", "inherit"],
    input: brief,
  });

  if (error !== undefined) {
    throw new Error(`Cannot run ${claudeBinary} in ${directory}`, {
      cause: error,
    });
  }

  const result = parseResult(stdout);

  if (result === undefined) {
    throw new Error(
      `${claudeBinary} ${args.join(" ")} in ${directory} ${signal === null ? `exited with code ${status}` : `was killed by ${signal}`} without a result`,
    );
  }

  return {
    session: result.session_id,
    report: result.result ?? result.errors?.join("\n") ?? result.subtype,
    succeeded: !result.is_error && status === 0,
    denied: [
      ...new Set(
        result.permission_denials.map(({ tool_name: tool }) => {
          return tool;
        }),
      ),
    ],
  };
}
