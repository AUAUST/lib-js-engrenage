import { listReferenceFiles } from "#tools/agents/operations/listReferenceFiles";
import { formatReferenceMarker } from "#tools/agents/utils/formatReferenceMarker";
import { listReferences } from "#tools/agents/utils/listReferences";
import { relocateInstructionReference } from "#tools/agents/utils/relocateInstructionReference";
import type { Filesystem } from "#foundation/filesystem/index";
import type { ResolvedAgents } from "#tools/agents/types/ResolvedAgents";

// @debt a snippet of `agents.snippetsDir` overriding a former reference stops applying once its marker is relocated, without a warning
// @debt markers naming an external extension's former `agents/<kind>/` fragments are left unresolvable, as only engrenage's own locations are relocated
/**
 * Rewrites the `@reference` markers of instruction files and the backlog index
 * that name an engrenage fragment by its former location.
 */
export async function migrateInstructionLocations(config: {
  filesystem: Filesystem;
  agents: ResolvedAgents;
}) {
  const { filesystem } = config;

  for (const file of await listReferenceFiles(config)) {
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
