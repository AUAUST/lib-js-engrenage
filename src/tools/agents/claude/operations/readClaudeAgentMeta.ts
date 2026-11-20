import {
  boolean,
  exactOptional,
  integer,
  looseObject,
  minValue,
  number,
  pipe,
  string,
  type InferOutput,
} from "valibot";

import { readTextFile } from "#foundation/filesystem/index";
import { parseJson } from "#foundation/json/index";
import { validate } from "#foundation/options/index";
import type { File } from "#types/File";

const transcriptExtension = ".jsonl";

const metaSchema = looseObject({
  agentType: string(),
  description: exactOptional(string()),
  worktreePath: exactOptional(string()),
  toolUseId: exactOptional(string()),
  spawnDepth: exactOptional(pipe(number(), integer(), minValue(0))),
  finished: exactOptional(boolean()),
});

export async function readClaudeAgentMeta(
  transcript: File,
): Promise<InferOutput<typeof metaSchema> | undefined> {
  if (!transcript.endsWith(transcriptExtension)) {
    throw new Error(`Not a Claude agent transcript: ${transcript}`);
  }

  const path = `${transcript.slice(0, -transcriptExtension.length)}.meta.json`;

  const content = await readTextFile(path);

  return content === undefined
    ? undefined
    : validate(metaSchema, parseJson(content, path), path);
}
