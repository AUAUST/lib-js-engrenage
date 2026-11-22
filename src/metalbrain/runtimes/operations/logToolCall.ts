import { appendFile, mkdir, readFile, rm } from "node:fs/promises";
import { join } from "node:path";

import {
  callsExtension,
  mainAgent,
  statsDirectory,
} from "#metalbrain/runtimes/constants";
import { readIssuingMessage } from "#metalbrain/runtimes/operations/readIssuingMessage";
import { readModelFacts } from "#metalbrain/runtimes/operations/readModelFacts";
import { isFiniteNumber } from "#metalbrain/runtimes/utils/isFiniteNumber";
import { isMissingFile } from "#metalbrain/runtimes/utils/isMissingFile";
import { isRecord } from "#metalbrain/runtimes/utils/isRecord";
import { isText } from "#metalbrain/runtimes/utils/isText";
import { priceMessage } from "#metalbrain/runtimes/utils/priceMessage";
import { resolveStartFile } from "#metalbrain/runtimes/utils/resolveStartFile";
import { resolveTranscript } from "#metalbrain/runtimes/utils/resolveTranscript";
import type { HookContext } from "#metalbrain/runtimes/types/HookContext";
import type { ToolCall } from "#metalbrain/runtimes/types/ToolCall";
import type { ToolPayload } from "#metalbrain/runtimes/types/ToolPayload";
import type { File } from "#types/File";

const shellTool = "Bash";

const pathFields = ["file_path", "notebook_path", "path"] as const;

// @debt guesses the field names, as Claude Code's Bash response carries no exit code and documents none for other tools
const exitCodeFields = ["exitCode", "exit_code"] as const;

async function takeStart(file: File): Promise<number | undefined> {
  try {
    const start = Number(await readFile(file, "utf-8"));

    await rm(file, { force: true });

    return isFiniteNumber(start) ? start : undefined;
  } catch (error) {
    if (isMissingFile(error)) {
      return;
    }

    throw error;
  }
}

function readResultText(response: unknown): string {
  if (isText(response)) {
    return response;
  }

  if (
    isRecord(response) &&
    (isText(response.stdout) || isText(response.stderr))
  ) {
    return `${isText(response.stdout) ? response.stdout : ""}${isText(response.stderr) ? response.stderr : ""}`;
  }

  return response === undefined ? "" : JSON.stringify(response);
}

function countLines(text: string): number {
  if (text === "") {
    return 0;
  }

  return text.split("\n").length - (text.endsWith("\n") ? 1 : 0);
}

function readTargets(
  tool: string,
  input: Readonly<Record<string, unknown>>,
): Pick<ToolCall, "command" | "path" | "pattern"> {
  const command = tool === shellTool ? input.command : undefined;

  const path = pathFields.map((field) => input[field]).find(isText);

  const { pattern } = input;

  return {
    ...(isText(command) ? { command } : {}),
    ...(path === undefined ? {} : { path }),
    ...(isText(pattern) ? { pattern } : {}),
  };
}

function readExitCode(response: unknown): Pick<ToolCall, "exitCode"> {
  if (!isRecord(response)) {
    return {};
  }

  const code = exitCodeFields
    .map((field) => {
      return response[field];
    })
    .find(isFiniteNumber);

  return code === undefined ? {} : { exitCode: code };
}

async function readMessage(
  payload: ToolPayload,
): Promise<Pick<ToolCall, "message">> {
  const found = await readIssuingMessage(
    resolveTranscript(payload),
    payload.toolUse,
  );

  if (found === undefined) {
    return {};
  }

  const { issuing, contextGain } = found;

  const price = priceMessage(await readModelFacts(), issuing);

  return {
    message: {
      model: issuing.model,
      tier: price?.tier ?? null,
      tokens: issuing.tokens,
      context: issuing.context,
      ...(contextGain === undefined ? {} : { contextGain }),
      cost: price?.cost ?? null,
    },
  };
}

/**
 * PostToolUse: appends the call to its agent's `.calls.jsonl` log under the
 * session's stats, with its duration when its PreToolUse stored a start, its
 * output size and the issuing assistant message priced from the transcript's tail.
 */
export async function logToolCall(
  payload: ToolPayload,
  { root, time }: HookContext,
): Promise<void> {
  const { session, agent = mainAgent, role = mainAgent, tool, input } = payload;

  const [start, message] = await Promise.all([
    takeStart(resolveStartFile(root, payload)),
    readMessage(payload),
  ]);

  const text = readResultText(payload.response);

  const call: ToolCall = {
    ...(start === undefined ? {} : { start: new Date(start).toISOString() }),
    end: new Date(time).toISOString(),
    ...(start === undefined ? {} : { duration: time - start }),
    session,
    agent,
    role,
    tool,
    ...readTargets(tool, input),
    ...readExitCode(payload.response),
    result: {
      characters: text.length,
      lines: countLines(text),
    },
    ...message,
  };

  const directory = join(root, statsDirectory, session);

  await mkdir(directory, { recursive: true });

  await appendFile(
    join(directory, `${agent}${callsExtension}`),
    `${JSON.stringify(call)}\n`,
  );
}
