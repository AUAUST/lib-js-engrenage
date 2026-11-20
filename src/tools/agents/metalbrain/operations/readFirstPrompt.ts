import { createReadStream } from "node:fs";
import { createInterface } from "node:readline";

import { isMissingFile } from "#tools/agents/metalbrain/utils/isMissingFile";
import { readPromptText } from "#tools/agents/metalbrain/utils/readPromptText";
import type { File } from "#types/File";

// @debt reads Claude's transcript entries, whose format Claude does not document as a contract
/**
 * Reads the first user prompt of a transcript; nothing for a missing transcript
 * or one opening with another entry.
 */
export async function readFirstPrompt(
  transcript: File,
): Promise<string | undefined> {
  const lines = createInterface({
    input: createReadStream(transcript, "utf-8"),
    crlfDelay: Infinity,
  });

  try {
    const first = await lines[Symbol.asyncIterator]().next();

    return first.done === true
      ? undefined
      : readPromptText(JSON.parse(first.value));
  } catch (error) {
    if (isMissingFile(error)) {
      return;
    }

    throw error;
  } finally {
    lines.close();
  }
}
