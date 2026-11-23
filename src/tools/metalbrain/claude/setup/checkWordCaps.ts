import { posix } from "node:path";

import { integer, minValue, number, pipe, record, string } from "valibot";

import { parseJson } from "#foundation/json/index";
import { validate } from "#foundation/options/index";
import { agentsFile } from "#metalbrain/instructions/constants";
import { parseInstruction } from "#metalbrain/instructions/index";
import { throwViolations } from "#metalbrain/records/index";
import {
  claudeAgentsDir,
  claudeFile,
  claudeRulesGlob,
  claudeSkillsDir,
  mainRole,
} from "#metalbrain/runtimes/constants";
import {
  formerWordCapsFile,
  wordCapsFile,
} from "#tools/metalbrain/claude/constants";
import type { LoadedConfig } from "#project/config/index";
import type { File } from "#types/File";

const wordCapsSchema = record(string(), pipe(number(), integer(), minValue(0)));

type WordCaps = Record<string, number>;

function countLoadedWords(text: string): number {
  const trimmed = text.trim();

  return trimmed === "" ? 0 : trimmed.split(/\s+/).length;
}

async function readStartWords(
  { filesystem }: LoadedConfig["context"],
  file: File,
): Promise<number> {
  const content = await filesystem.read(file);

  if (content == null) {
    return 0;
  }

  const { body, paths } = parseInstruction(content, file);

  return paths === undefined ? countLoadedWords(body) : 0;
}

// @debt the main session also loads every skill and agent description through its listings, which no role counts
async function measureRoles(
  context: LoadedConfig["context"],
): Promise<WordCaps> {
  const { filesystem } = context;

  let base = 0;

  const files = [
    claudeFile,
    agentsFile,
    ...(await filesystem.glob(claudeRulesGlob)),
  ];

  for (const file of files) {
    base += await readStartWords(context, file);
  }

  const roles: WordCaps = { [mainRole]: base };

  for (const file of await filesystem.glob(`${claudeAgentsDir}/*.md`)) {
    const words = await readStartWords(context, file);

    roles[`agent:${posix.basename(file, ".md")}`] = base + words;
  }

  for (const file of await filesystem.glob(`${claudeSkillsDir}/*/SKILL.md`)) {
    const words = await readStartWords(context, file);

    roles[`skill:${posix.basename(posix.dirname(file))}`] = base + words;
  }

  return roles;
}

function sortRoles(roles: WordCaps): WordCaps {
  return Object.fromEntries(
    Object.entries(roles).toSorted(([a], [b]) => {
      return a.localeCompare(b);
    }),
  );
}

async function readWordCaps({
  filesystem,
}: LoadedConfig["context"]): Promise<string | undefined> {
  const content = await filesystem.read(wordCapsFile);

  const former = await filesystem.read(formerWordCapsFile);

  if (former == null) {
    return content;
  }

  if (content != null) {
    throw new Error(
      `${formerWordCapsFile} and ${wordCapsFile} both exist: keep the caps in ${wordCapsFile}, then delete ${formerWordCapsFile}`,
    );
  }

  await filesystem.write(wordCapsFile, former);

  await filesystem.remove(formerWordCapsFile);

  return former;
}

/**
 * Measures each Claude role's words loaded at start, `CLAUDE.md`, `AGENTS.md`
 * and the rules without `paths`, plus its agent file or skill, against
 * its word cap in `.engrenage/word-caps.json`: moves the caps there from
 * `.engrenage/word-budgets.json`, seeds the file when absent, lowers each cap
 * its role went under and drops the roles gone. Does nothing unless `claude`
 * is a preferred agent.
 *
 * @throws {Error} When a role exceeds its word cap or has none, or both
 * cap files exist.
 */
export async function checkWordCaps(config: LoadedConfig): Promise<void> {
  const { context } = config;

  const agents = await config.resolve("agents");

  if (agents.preferred?.includes("claude") !== true) {
    return;
  }

  const measured = await measureRoles(context);

  const content = await readWordCaps(context);

  if (content == null) {
    return void (await context.filesystem.write(
      wordCapsFile,
      `${JSON.stringify(sortRoles(measured), null, 2)}\n`,
    ));
  }

  const caps: WordCaps = validate(
    wordCapsSchema,
    parseJson(content, wordCapsFile),
    wordCapsFile,
  );

  const settled: WordCaps = {};

  const violations: string[] = [];

  for (const [role, words] of Object.entries(measured)) {
    const cap = caps[role];

    if (cap === undefined) {
      violations.push(
        `${role}: ${words} words, no word cap; once the user approved the role, record it as "${role}": ${words}`,
      );

      continue;
    }

    if (words > cap) {
      violations.push(
        `${role}: ${words} words, ${words - cap} over its word cap of ${cap}; cut as many, or raise the cap only on the user's decision`,
      );
    }

    settled[role] = Math.min(words, cap);
  }

  const next = `${JSON.stringify(sortRoles(settled), null, 2)}\n`;

  if (violations.length === 0 && next !== content) {
    await context.filesystem.write(wordCapsFile, next);
  }

  throwViolations(`Roles over their word caps in ${wordCapsFile}:`, violations);
}
