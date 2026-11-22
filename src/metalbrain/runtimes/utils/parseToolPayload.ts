import { isRecord } from "#metalbrain/runtimes/utils/isRecord";
import { isText } from "#metalbrain/runtimes/utils/isText";
import type { ToolPayload } from "#metalbrain/runtimes/types/ToolPayload";

const pathSegment = /^[\w\-]+$/v;

function readText(value: unknown, field: string): string {
  if (!isText(value) || value === "") {
    throw new Error(`Claude Code hook payload: ${field} must be a string`);
  }

  return value;
}

function readSegment(value: unknown, field: string): string {
  const text = readText(value, field);

  if (!pathSegment.test(text)) {
    throw new Error(`Claude Code hook payload: ${field} must be a file name`);
  }

  return text;
}

/**
 * Reads a Claude Code PreToolUse or PostToolUse payload, failing on fields the
 * hook names files after unless each is a plain file name.
 */
export function parseToolPayload(value: unknown): ToolPayload {
  if (!isRecord(value)) {
    throw new Error("Claude Code hook payload must be an object");
  }

  const {
    session_id: session,
    transcript_path: transcript,
    agent_id: agent,
    agent_type: role,
    tool_name: tool,
    tool_use_id: toolUse,
    tool_input: input,
    tool_response: response,
  } = value;

  return {
    session: readSegment(session, "session_id"),
    transcript: readText(transcript, "transcript_path"),
    ...(agent === undefined ? {} : { agent: readSegment(agent, "agent_id") }),
    ...(role === undefined ? {} : { role: readText(role, "agent_type") }),
    tool: readText(tool, "tool_name"),
    toolUse: readSegment(toolUse, "tool_use_id"),
    input: isRecord(input) ? input : {},
    ...(response === undefined ? {} : { response }),
  };
}
