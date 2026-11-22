import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

import {
  statsDirectory,
  thoroughnessExtension,
} from "#metalbrain/runtimes/hooks/constants";
import { readAppendedLines } from "#metalbrain/runtimes/hooks/operations/readAppendedLines";
import { readFirstPrompt } from "#metalbrain/runtimes/hooks/operations/readFirstPrompt";
import { readLatestContext } from "#metalbrain/runtimes/hooks/operations/readLatestContext";
import { readThoroughnessLimits } from "#metalbrain/runtimes/hooks/operations/readThoroughnessLimits";
import { isMissingFile } from "#metalbrain/runtimes/hooks/utils/isMissingFile";
import { isRecord } from "#metalbrain/runtimes/hooks/utils/isRecord";
import { isThoroughnessLevel } from "#metalbrain/runtimes/hooks/utils/isThoroughnessLevel";
import { parseThoroughnessState } from "#metalbrain/runtimes/hooks/utils/parseThoroughnessState";
import { parseTranscriptLine } from "#metalbrain/runtimes/hooks/utils/parseTranscriptLine";
import { readPromptText } from "#metalbrain/runtimes/hooks/utils/readPromptText";
import { resolveTranscript } from "#metalbrain/runtimes/hooks/utils/resolveTranscript";
import type { HookAction } from "#metalbrain/runtimes/types/HookAction";
import type { ThoroughnessLevel } from "#metalbrain/runtimes/types/ThoroughnessLevel";
import type { ThoroughnessState } from "#metalbrain/runtimes/types/ThoroughnessState";
import type { File } from "#types/File";

const thoroughnessLine = /^Thoroughness:\s*(?<level>\w+)\s*$/gmv;

const thoroughnessMention = /\bThoroughness:\s*(?<level>\w+)\b/gv;

async function readState(file: File): Promise<ThoroughnessState | undefined> {
  try {
    return parseThoroughnessState(JSON.parse(await readFile(file, "utf-8")));
  } catch (error) {
    if (isMissingFile(error)) {
      return;
    }

    throw error;
  }
}

function findLastLevel(
  prompt: string,
  pattern: RegExp,
  known: readonly string[],
): string | undefined {
  return Array.from(prompt.matchAll(pattern), (match) => {
    return match.groups?.level;
  })
    .filter((level) => {
      return level !== undefined && known.includes(level);
    })
    .at(-1);
}

/**
 * The level a brief names: the last known level on a `Thoroughness:` line of its
 * own, otherwise the last one named anywhere, otherwise `fallback`.
 */
async function readLevel(
  transcript: File,
  known: readonly string[],
  fallback: ThoroughnessLevel,
): Promise<ThoroughnessLevel> {
  const prompt = (await readFirstPrompt(transcript)) ?? "";

  const level = (
    findLastLevel(prompt, thoroughnessLine, known) ??
    findLastLevel(prompt, thoroughnessMention, known)
  );

  return isThoroughnessLevel(level) ? level : fallback;
}

/**
 * The warnings a gain calls for: one on reaching the token limit, then one at
 * each further half of it.
 */
function countThresholds(gain: number, limit: number): number {
  return gain < limit ? 0 : Math.floor((gain - limit) / (limit / 2)) + 1;
}

// @debt reads Claude's transcript entries, whose format Claude does not document as a contract: a caller's message is a prompt not marked meta, or one marked meta with a `coordinator` origin
/**
 * Whether transcript lines hold a message from the agent's caller: a brief, a
 * resume or a message sent while it runs.
 */
function hasCallerMessage(text: string): boolean {
  return text.split("\n").some((line) => {
    const entry = parseTranscriptLine(line);

    const prompt = readPromptText(entry);

    if (!isRecord(entry) || prompt === undefined || prompt === "") {
      return false;
    }

    return (
      entry.isMeta !== true ||
      (isRecord(entry.origin) && entry.origin.kind === "coordinator")
    );
  });
}

async function writeState(file: File, state: ThoroughnessState): Promise<void> {
  await writeFile(file, `${JSON.stringify(state)}\n`);
}

/**
 * PreToolUse, for a subagent: measures the context it gained since the first
 * measured call of its current contact, opened by its brief or its caller's latest
 * message, from the latest assistant message its transcript holds, against the
 * token limit of its brief's `Thoroughness:` level, or of `fallback`, and returns
 * a thoroughness warning, logged in its state, each time the gain crosses the
 * limit or a further half of it within the contact: the first letting it finish a
 * remainder the thoroughness-level rules allow, each later one telling it to stop.
 */
// @debt runs synchronously on every subagent tool call, and a metalbrain hook takes ~167 ms per call; its share of agent wall time is unmeasured
export function checkThoroughness(fallback: ThoroughnessLevel): HookAction {
  return async (payload, { root, time }) => {
    const { session, agent } = payload;

    if (agent === undefined) {
      return;
    }

    const transcript = resolveTranscript(payload);

    // @debt measures the context up to one message late, as Claude Code at times writes the issuing message only after PreToolUse and its payload carries no context size
    const context = await readLatestContext(transcript);

    if (context === undefined) {
      return;
    }

    const directory = join(root, statsDirectory, session);

    const file = join(directory, `${agent}${thoroughnessExtension}`);

    const stored = await readState(file);

    const appended = await readAppendedLines(transcript, stored?.scanned ?? 0);

    if (appended === undefined) {
      return;
    }

    if (stored === undefined) {
      const { levels } = await readThoroughnessLimits();

      const level = await readLevel(transcript, Object.keys(levels), fallback);

      await mkdir(directory, { recursive: true });

      await writeState(file, {
        level,
        limit: levels[level],
        warnings: [],
        start: context,
        opened: 0,
        scanned: appended.end,
      });

      return;
    }

    const { level, limit, warnings, start, opened, scanned } = stored;

    if (hasCallerMessage(appended.text)) {
      return void (await writeState(file, {
        ...stored,
        start: context,
        opened: warnings.length,
        scanned: appended.end,
      }));
    }

    const gain = context - start;

    const last = warnings.slice(opened).at(-1);

    if (
      countThresholds(gain, limit) <=
      (last === undefined ? 0 : countThresholds(last.gain, limit))
    ) {
      if (appended.end !== scanned) {
        await writeState(file, { ...stored, scanned: appended.end });
      }

      return;
    }

    await writeState(file, {
      ...stored,
      warnings: [...warnings, { time: new Date(time).toISOString(), gain }],
      scanned: appended.end,
    });

    const past = `Thoroughness warning: ${gain} tokens gained past the ${level} token limit of ${limit}.`;

    return last === undefined
      ? `${past} Finish the step under way, then list what remains: finish it only as Analysis › Thoroughness levels allows, otherwise stop and report as a thoroughness stop.`
      : `${past} Warned again: finish the step under way, then stop and report as a thoroughness stop.`;
  };
}
