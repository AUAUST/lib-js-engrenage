import { posix } from "node:path";

import { integer, minValue, number, pipe, record, string } from "valibot";

import { parseJson } from "#foundation/json/index";
import { validate } from "#foundation/options/index";
import { parseInstruction } from "#metalbrain/instructions/index";
import { throwViolations } from "#metalbrain/records/index";
import {
  agentsFile,
  claudeAgentsDir,
  claudeFile,
  claudeRulesGlob,
  claudeSkillsDir,
  mainRole,
} from "#tools/agents/constants";
import { wordBudgetsFile } from "#tools/metalbrain/claude/constants";
import type { LoadedConfig } from "#project/config/index";
import type { File } from "#types/File";

const budgetsSchema = record(string(), pipe(number(), integer(), minValue(0)));

type WordBudgets = Record<string, number>;

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
): Promise<WordBudgets> {
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

  const roles: WordBudgets = { [mainRole]: base };

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

function sortRoles(roles: WordBudgets): WordBudgets {
  return Object.fromEntries(
    Object.entries(roles).toSorted(([a], [b]) => {
      return a.localeCompare(b);
    }),
  );
}

/**
 * Measures each Claude role's words loaded at start, `CLAUDE.md`, `AGENTS.md`
 * and the rules without `paths`, plus its agent file or skill, against its
 * budget in `.engrenage/word-budgets.json`: seeds the file when absent, lowers
 * each budget its role went under and drops the roles gone. Does nothing unless
 * `claude` is a preferred agent.
 *
 * @throws {Error} When a role exceeds its budget or has none.
 */
export async function checkWordBudgets(config: LoadedConfig): Promise<void> {
  const { context } = config;

  const agents = await config.resolve("agents");

  if (agents.preferred?.includes("claude") !== true) {
    return;
  }

  const measured = await measureRoles(context);

  const content = await context.filesystem.read(wordBudgetsFile);

  if (content == null) {
    return void (await context.filesystem.write(
      wordBudgetsFile,
      `${JSON.stringify(sortRoles(measured), null, 2)}\n`,
    ));
  }

  const budgets: WordBudgets = validate(
    budgetsSchema,
    parseJson(content, wordBudgetsFile),
    wordBudgetsFile,
  );

  const settled: WordBudgets = {};

  const violations: string[] = [];

  for (const [role, words] of Object.entries(measured)) {
    const budget = budgets[role];

    if (budget === undefined) {
      violations.push(
        `${role}: ${words} words, no budget; once the user approved the role, record it as "${role}": ${words}`,
      );

      continue;
    }

    if (words > budget) {
      violations.push(
        `${role}: ${words} words, ${words - budget} over its budget of ${budget}; cut as many, or raise the budget only on the user's decision`,
      );
    }

    settled[role] = Math.min(words, budget);
  }

  const next = `${JSON.stringify(sortRoles(settled), null, 2)}\n`;

  if (violations.length === 0 && next !== content) {
    await context.filesystem.write(wordBudgetsFile, next);
  }

  throwViolations(
    `Roles over their word budgets in ${wordBudgetsFile}:`,
    violations,
  );
}
