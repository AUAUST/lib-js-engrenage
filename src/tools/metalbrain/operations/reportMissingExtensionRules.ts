import { includes } from "@auaust/toolkit/array";

import { hasPreferredAgents } from "#metalbrain/runtimes/index";
import { listMissingExtensionRules } from "#tools/agents/index";
import { addRuleCommand, agentsTarget } from "#tools/metalbrain/constants";
import { loadMetalbrainFacts } from "#tools/metalbrain/operations/loadMetalbrainFacts";
import type { SyncDone } from "#project/sync/index";

export async function reportMissingExtensionRules({
  config,
  targets,
}: SyncDone): Promise<void> {
  if (
    !includes(targets, agentsTarget) ||
    !hasPreferredAgents(await config.resolve("agents"))
  ) {
    return;
  }

  const missing = await listMissingExtensionRules(
    config,
    await loadMetalbrainFacts(config),
  );

  if (missing.length === 0) {
    return;
  }

  const names = missing.map(({ name }) => name).join(", ");

  config.context.reporter.info(
    `Active extensions ship default agent rules this project lacks: ${names}. Consider reviewing them and installing each with ${addRuleCommand} <name>.`,
  );
}
