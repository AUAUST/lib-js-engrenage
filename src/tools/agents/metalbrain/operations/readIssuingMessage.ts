import { open } from "node:fs/promises";

import { findIssuingMessage } from "#tools/agents/metalbrain/utils/findIssuingMessage";
import { isMissingFile } from "#tools/agents/metalbrain/utils/isMissingFile";
import type { AssistantMessage } from "#tools/agents/metalbrain/types/AssistantMessage";
import type { File } from "#types/File";

const tailSizes = [64 * 1024, 1024 * 1024, 4 * 1024 * 1024] as const;

/**
 * Reads, from a transcript's tail, the assistant message issuing a tool use and
 * the context it gained over the message before it. Reads a longer tail until
 * both show, up to the largest tail size; the gain stays unknown past it. Returns
 * nothing for a missing transcript or a tool use the tail lacks.
 */
export async function readIssuingMessage(
  transcript: File,
  toolUse: string,
): Promise<{ issuing: AssistantMessage; contextGain?: number } | undefined> {
  let handle;

  try {
    handle = await open(transcript, "r");
  } catch (error) {
    if (isMissingFile(error)) {
      return;
    }

    throw error;
  }

  try {
    const { size } = await handle.stat();

    let found: ReturnType<typeof findIssuingMessage>;

    for (const tailSize of tailSizes) {
      const start = Math.max(0, size - tailSize);

      const buffer = Buffer.alloc(size - start);

      await handle.read(buffer, 0, buffer.length, start);

      const text = buffer.toString("utf-8");

      found = findIssuingMessage(
        start === 0 ? text : text.slice(text.indexOf("\n") + 1),
        toolUse,
      );

      if (found?.previous !== undefined) {
        return {
          issuing: found.issuing,
          contextGain: found.issuing.context - found.previous.context,
        };
      }

      if (start === 0) {
        return found === undefined
          ? undefined
          : { issuing: found.issuing, contextGain: found.issuing.context };
      }
    }

    return found === undefined ? undefined : { issuing: found.issuing };
  } finally {
    await handle.close();
  }
}
