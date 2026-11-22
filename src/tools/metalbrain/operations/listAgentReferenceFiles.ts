import { listReferenceFiles } from "#metalbrain/instructions/index";
import { hasPreferredAgents } from "#metalbrain/runtimes/index";
import type { LoadedConfig } from "#project/config/index";
import type { File } from "#types/File";

/**
 * The files the `reference` directive fills: none unless `agents.preferred`
 * names an agent.
 */
export async function listAgentReferenceFiles(
  config: LoadedConfig,
): Promise<readonly File[]> {
  const agents = await config.resolve("agents");

  if (!hasPreferredAgents(agents)) {
    return [];
  }

  return listReferenceFiles({
    filesystem: config.context.filesystem,
    instructionFiles: agents.instructionFiles,
  });
}
