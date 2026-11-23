import { isString } from "@auaust/toolkit";

import { legacyLogs } from "#metalbrain/logs/constants";
import {
  appendRecordEntry,
  createRecordId,
  formatRecordDocument,
  listRecordIds,
  readRecordDocument,
  throwViolations,
} from "#metalbrain/records/index";
import type { Filesystem } from "#foundation/filesystem/index";
import type { File } from "#types/File";
import type { Globs } from "#types/Globs";

const linePattern = /^- (?<subject>.+?): (?<first>.+?) — (?<second>.+)$/u;

type LegacyLog = (typeof legacyLogs)[number];

function parseLegacyLog({ kind, file }: LegacyLog, content: string) {
  const [subject = "", first = "", second = ""] = Object.keys(kind.fields);

  const entries: Record<string, string>[] = [];

  const violations: string[] = [];

  for (const [index, line] of content.split("\n").entries()) {
    if (line.trim() === "" || line.startsWith("# ")) {
      continue;
    }

    const groups = linePattern.exec(line.trim())?.groups;

    if (groups === undefined) {
      violations.push(
        `${file}:${index + 1}: expected \`- <${subject}>: <${first}> — <${second}>\`, read \`${line}\``,
      );

      continue;
    }

    entries.push({
      [subject]: groups.subject?.trim() ?? "",
      [first]: groups.first?.trim() ?? "",
      [second]: groups.second?.trim() ?? "",
    });
  }

  return { entries, violations };
}

async function listMentions(
  filesystem: Filesystem,
  instructionFiles: Globs,
): Promise<File[]> {
  const mentions: File[] = [];

  for (const file of await filesystem.glob(instructionFiles)) {
    const content = await filesystem.read(file);

    if (
      isString(content) &&
      legacyLogs.some((log) => content.includes(log.file))
    ) {
      mentions.push(file);
    }
  }

  return mentions;
}

/**
 * Moves each legacy Markdown log line, `- <subject>: <…> — <…>`, to the end
 * of its log kind's YAML file as an entry with an ID of `day`, keeping its
 * text, then deletes the Markdown log; skipped while an instruction file of
 * `instructionFiles` names a legacy log, which agents would then still append.
 *
 * @returns The instruction files naming a legacy log, when a log is left
 * unmigrated because of them.
 * @throws {Error} When a line departs from the log line shape, naming each such
 * line and writing nothing.
 */
export async function migrateAgentLogs(
  filesystem: Filesystem,
  day: Date,
  instructionFiles: Globs,
): Promise<File[]> {
  const logs: { log: LegacyLog; content: string }[] = [];

  for (const log of legacyLogs) {
    const content = await filesystem.read(log.file);

    if (content !== undefined) {
      logs.push({ log, content });
    }
  }

  if (logs.length === 0) {
    return [];
  }

  const mentions = await listMentions(filesystem, instructionFiles);

  if (mentions.length > 0) {
    return mentions;
  }

  const parsed = logs.map(({ log, content }) => {
    return { log, ...parseLegacyLog(log, content) };
  });

  throwViolations(
    "Agent log lines depart from the log line shape, so no log was migrated:",
    parsed.flatMap(({ violations }) => violations),
  );

  for (const { log, entries } of parsed) {
    const record = await readRecordDocument(
      filesystem,
      log.kind,
      log.kind.name,
    );

    const taken = await listRecordIds(filesystem, log.kind);

    for (const entry of entries) {
      const id = createRecordId(taken, day);

      taken.add(id);

      appendRecordEntry(log.kind, record, { id, ...entry });
    }

    if (entries.length > 0) {
      await filesystem.write(
        record.file,
        formatRecordDocument(record.document),
      );
    }

    await filesystem.remove(log.file);
  }

  return [];
}
