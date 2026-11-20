import { open } from "node:fs/promises";

import { isMissingFile } from "#tools/agents/metalbrain/utils/isMissingFile";
import type { File } from "#types/File";

const tailSizes = [64 * 1024, 1024 * 1024, 4 * 1024 * 1024] as const;

/**
 * Scans a transcript's tail, cut to whole lines, reading a longer tail until
 * `scan` returns a result, telling it whether the tail holds the whole transcript
 * and whether it is the last tail read. Returns nothing for a missing transcript.
 */
export async function scanTranscriptTail<Result>(
  transcript: File,
  scan: (
    text: string,
    tail: { readonly whole: boolean; readonly last: boolean },
  ) => Result | undefined,
): Promise<Result | undefined> {
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

    for (const [index, tailSize] of tailSizes.entries()) {
      const start = Math.max(0, size - tailSize);

      const whole = start === 0;

      const buffer = Buffer.alloc(size - start);

      await handle.read(buffer, 0, buffer.length, start);

      const text = buffer.toString("utf-8");

      const result = scan(whole ? text : text.slice(text.indexOf("\n") + 1), {
        whole,
        last: whole || index === tailSizes.length - 1,
      });

      if (result !== undefined || whole) {
        return result;
      }
    }
  } finally {
    await handle.close();
  }
}
