import { parseTOML } from "confbox/toml";
import {
  literal,
  looseObject,
  object,
  optional,
  safeParse,
  string,
  variant,
} from "valibot";

import { readTextFile, resolveWithin } from "#foundation/filesystem/index";
import { validate } from "#foundation/options/index";
import { spawnProcess } from "#foundation/processes/index";
import { codexAgentsDir, codexBinary } from "#tools/agents/codex/constants";
import type { AgentDispatch } from "#tools/agents/types/AgentDispatch";
import type { AgentReport } from "#tools/agents/types/AgentReport";

const profileSchema = looseObject({
  developer_instructions: string(),
  model_reasoning_effort: optional(string()),
});

const eventSchema = variant("type", [
  object({ type: literal("thread.started"), thread_id: string() }),
  object({
    type: literal("item.completed"),
    item: looseObject({ type: string(), text: optional(string()) }),
  }),
  object({ type: literal("turn.completed") }),
  object({
    type: literal("turn.failed"),
    error: looseObject({ message: string() }),
  }),
  object({ type: literal("error"), message: string() }),
]);

function toTomlString(value: string): string {
  return JSON.stringify(value);
}

async function createStartArgs(
  directory: AgentDispatch["directory"],
  agent: string,
  effort: AgentDispatch["effort"],
): Promise<readonly string[]> {
  const file = resolveWithin(directory, codexAgentsDir, `${agent}.toml`);

  const content = await readTextFile(file);

  if (content === undefined) {
    throw new Error(
      `${file} is missing: ${directory} defines no Codex agent ${agent}`,
    );
  }

  const profile = validate(profileSchema, parseTOML(content), file);

  const reasoning = effort ?? profile.model_reasoning_effort;

  return [
    "exec",
    "--json",
    "--config",
    `developer_instructions=${toTomlString(profile.developer_instructions)}`,
    ...(reasoning === undefined
      ? []
      : ["--config", `model_reasoning_effort=${toTomlString(reasoning)}`]),
    "-",
  ];
}

function readEvents(stdout: string) {
  let session: string | undefined;
  let report: string | undefined;
  let failure: string | undefined;
  let completed = false;

  for (const line of stdout.split("\n")) {
    if (line.trim() === "") {
      continue;
    }

    let value: unknown;

    try {
      value = JSON.parse(line);
    } catch {
      continue;
    }

    const parsed = safeParse(eventSchema, value);

    if (!parsed.success) {
      continue;
    }

    const event = parsed.output;

    switch (event.type) {
      case "thread.started": {
        session = event.thread_id;

        break;
      }

      case "item.completed": {
        if (
          event.item.type === "agent_message" &&
          event.item.text !== undefined
        ) {
          report = event.item.text;
        }

        break;
      }

      case "turn.completed": {
        completed = true;

        break;
      }

      case "turn.failed": {
        failure = event.error.message;

        break;
      }

      case "error": {
        failure ??= event.message;

        break;
      }
    }
  }

  return {
    session,
    report,
    failure,
    completed,
  };
}

// @debt a headless Codex run carries no agent identity into its hooks, so the target's dispatch check and stop gate never run for it
// @debt untested against a live Codex: whether a resumed session keeps the developer instructions its start set
export async function dispatchCodexAgent({
  directory,
  run,
  brief,
  effort,
  environment,
}: AgentDispatch): Promise<AgentReport> {
  const args = "agent" in run
    ? await createStartArgs(directory, run.agent, effort)
    : [
        "exec",
        "resume",
        "--json",
        ...(effort === undefined
          ? []
          : ["--config", `model_reasoning_effort=${toTomlString(effort)}`]),
        run.session,
        "-",
      ];

  const {
    status,
    signal,
    stdout,
    error,
  } = await spawnProcess(codexBinary, args, {
    cwd: directory,
    env: environment,
    stdio: ["pipe", "pipe", "inherit"],
    input: brief,
  });

  if (error !== undefined) {
    throw new Error(`Cannot run ${codexBinary} in ${directory}`, {
      cause: error,
    });
  }

  const { session, report, failure, completed } = readEvents(stdout);

  const id = session ?? ("session" in run ? run.session : undefined);

  if (id === undefined) {
    throw new Error(
      `${codexBinary} exec in ${directory} ${signal === null ? `exited with code ${status}` : `was killed by ${signal}`} without starting a session`,
    );
  }

  return {
    session: id,
    report: failure ?? report ?? "",
    succeeded: completed && failure === undefined && status === 0,
    denied: [],
  };
}
