import { codexFile } from "#tools/agents/codex/constants";
import { backlogIndex } from "#tools/agents/constants";
import type { Filesystem } from "#foundation/filesystem/index";
import type { ResolvedAgents } from "#tools/agents/types/ResolvedAgents";
import type { File } from "#types/File";

/**
 * The files whose `@reference` markers engrenage fills and migrates: the
 * instruction files but the Codex instructions, and the backlog index.
 */
export async function listReferenceFiles({
  filesystem,
  agents,
}: {
  filesystem: Filesystem;
  agents: ResolvedAgents;
}): Promise<readonly File[]> {
  const files = await filesystem.glob(agents.instructionFiles);

  const instructionFiles = files.filter((file) => file !== codexFile);

  return (await filesystem.exists(backlogIndex))
    ? [...instructionFiles, backlogIndex]
    : instructionFiles;
}
