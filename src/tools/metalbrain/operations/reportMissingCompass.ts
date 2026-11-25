import { includes } from "@auaust/toolkit/array";

import { hasPreferredAgents } from "#metalbrain/runtimes/index";
import { agentsTarget } from "#tools/metalbrain/constants";
import type { SyncDone } from "#project/sync/index";

export async function reportMissingCompass({
  config,
  targets,
}: SyncDone): Promise<void> {
  if (!includes(targets, agentsTarget)) {
    return;
  }

  const agents = await config.resolve("agents");

  if (!hasPreferredAgents(agents) || agents.compass !== undefined) {
    return;
  }

  config.context.reporter.info(
    "The project declares no Compass for its agents: set `agents.compass` to a paragraph stating what the project does, drafted with its maintainers.",
  );
}
