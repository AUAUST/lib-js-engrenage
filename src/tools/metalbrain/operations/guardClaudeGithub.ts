import { object, string } from "valibot";

import {
  findWordCapVerdict,
  resolveHookDirectory,
  validateHookPayload,
  type HookVerdict,
} from "#metalbrain/runtimes/index";
import { loadValidatedConfig } from "#project/config/index";
import {
  checkGithubWrite,
  checkIssueViews,
  resolveCurrentRepository,
} from "#tools/github/index";
import { measureGithubCommand } from "#tools/metalbrain/operations/measureGithubCommand";

const payloadSchema = object({
  cwd: string(),
  tool_input: object({
    command: string(),
  }),
});

/**
 * PreToolUse on a Bash `gh issue` command: denies a write breaking the issue
 * contract or an issue view missing its fields, else judges the written text
 * against the word caps.
 */
export async function guardClaudeGithub(
  payload: unknown,
): Promise<HookVerdict | undefined> {
  const {
    cwd,
    tool_input: { command },
  } = validateHookPayload(payloadSchema, payload, "Claude Code");

  const config = await loadValidatedConfig(resolveHookDirectory(cwd));

  const {
    repositories,
    contract: contractNames,
  } = await config.resolve("github");

  const reason = (
    (await checkGithubWrite(command, cwd, repositories, contractNames)) ??
    (await checkIssueViews(command, config.context.root, {
      repository: await resolveCurrentRepository(config.context.root),
      registry: await repositories(),
    }))
  );

  if (reason !== undefined) {
    return {
      decision: "deny",
      reason,
    };
  }

  const { wordCaps } = await config.resolve("agents");

  return findWordCapVerdict(
    measureGithubCommand(command, wordCaps),
    wordCaps.mode,
  );
}
