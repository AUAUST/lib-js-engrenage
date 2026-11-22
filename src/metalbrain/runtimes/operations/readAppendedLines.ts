import { open } from "node:fs/promises";

import { isMissingFile } from "#metalbrain/runtimes/utils/isMissingFile";
import type { File } from "#types/File";

/**
 * Reads the whole lines a file holds past byte `offset`, with the offset past
 * the last of them; nothing for a missing file.
 */
export async function readAppendedLines(
  file: File,
  offset: number,
): Promise<{ readonly text: string; readonly end: number } | undefined> {
  let handle;

  try {
    handle = await open(file, "r");
  } catch (error) {
    if (isMissingFile(error)) {
      return;
    }

    throw error;
  }

  try {
    const { size } = await handle.stat();

    const buffer = Buffer.alloc(Math.max(0, size - offset));

    await handle.read(buffer, 0, buffer.length, offset);

    const whole = buffer.subarray(0, buffer.lastIndexOf("\n") + 1);

    return { text: whole.toString("utf-8"), end: offset + whole.length };
  } finally {
    await handle.close();
  }
}
