import { backlogIndex } from "#tools/agents/constants";
import { formatReferenceMarker } from "#tools/agents/utils/formatReferenceMarker";
import { listReferences } from "#tools/agents/utils/listReferences";
import { relocateInstructionReference } from "#tools/agents/utils/relocateInstructionReference";
import type { Filesystem } from "#foundation/filesystem/index";
import type { ResolvedAgents } from "#tools/agents/types/ResolvedAgents";

/**
 * Rewrites the `@reference` markers of instruction files and the backlog index
 * that name an engrenage fragment by its former location.
 */
export async function migrateInstructionLocations(config: {
  filesystem: Filesystem;
  agents: ResolvedAgents;
}) {
  const { filesystem } = config;

  const files = await filesystem.glob(config.agents.instructionFiles);

  for (const file of [...files, backlogIndex]) {
    const content = await filesystem.read(file);

    if (content === undefined) {
      continue;
    }

    const rewritten = listReferences(content).reduce((current, reference) => {
      const relocated = relocateInstructionReference(reference);

      return relocated === reference
        ? current
        : current
            .split(formatReferenceMarker(reference))
            .join(formatReferenceMarker(relocated));
    }, content);

    if (rewritten !== content) {
      await filesystem.write(file, rewritten);
    }
  }
}
