import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

import { resolveStartFile } from "#tools/agents/metalbrain/utils/resolveStartFile";
import type { HookContext } from "#tools/agents/metalbrain/types/HookContext";
import type { ToolPayload } from "#tools/agents/metalbrain/types/ToolPayload";

/**
 * PreToolUse: stores the call's start time for its PostToolUse to read.
 */
export async function recordCallStart(
  payload: ToolPayload,
  { root, time }: HookContext,
): Promise<void> {
  const file = resolveStartFile(root, payload);

  await mkdir(dirname(file), { recursive: true });

  await writeFile(file, String(time));
}
