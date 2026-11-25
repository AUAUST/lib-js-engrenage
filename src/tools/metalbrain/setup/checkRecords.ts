import { recordKinds } from "#metalbrain/kinds/constants";
import {
  findNamespaceViolations,
  findRecordViolations,
  throwViolations,
} from "#metalbrain/records/index";
import { hasPreferredAgents } from "#metalbrain/runtimes/index";
import type { LoadedConfig } from "#project/config/index";

export async function checkRecords(config: LoadedConfig): Promise<void> {
  const agents = await config.resolve("agents");

  if (!hasPreferredAgents(agents)) {
    return;
  }

  const violations = findNamespaceViolations(recordKinds);

  for (const kind of recordKinds) {
    violations.push(
      ...(await findRecordViolations(
        config.context.filesystem,
        kind,
        agents.wordCaps[kind.wordCap],
      )),
    );
  }

  throwViolations("Agent records depart from their file schemas:", violations);
}
