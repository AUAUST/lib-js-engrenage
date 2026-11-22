import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

import { resolveStartFile } from "#metalbrain/runtimes/utils/resolveStartFile";
import type { HookContext } from "#metalbrain/runtimes/types/HookContext";
import type { ToolPayload } from "#metalbrain/runtimes/types/ToolPayload";

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
