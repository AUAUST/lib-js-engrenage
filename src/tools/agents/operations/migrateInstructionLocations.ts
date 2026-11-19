import { listReferenceFiles } from "#tools/agents/operations/listReferenceFiles";
import { formatReferenceMarker } from "#tools/agents/utils/formatReferenceMarker";
import { listReferences } from "#tools/agents/utils/listReferences";
import { relocateInstructionReference } from "#tools/agents/utils/relocateInstructionReference";
import type { Filesystem } from "#foundation/filesystem/index";
import type { Reporter } from "#foundation/reports/index";
import type { ResolvedAgents } from "#tools/agents/types/ResolvedAgents";

async function warnFormerSnippets(config: {
  filesystem: Filesystem;
  agents: ResolvedAgents;
  reporter: Reporter;
}) {
  const { snippetsDir } = config.agents;

  if (snippetsDir === undefined) {
    return;
  }

  for (const snippet of await config.filesystem.glob(
    `${snippetsDir}/**/*.md`,
  )) {
    const reference = snippet.slice(snippetsDir.length + 1);
    const relocated = relocateInstructionReference(reference);

    if (relocated !== reference) {
      config.reporter.warn(
        `${snippet} overrides the former reference "${reference}", which no marker names anymore: move it to ${snippetsDir}/${relocated}`,
      );
    }
  }
}

// @debt markers naming an external extension's former `agents/<kind>/` fragments are left unresolvable, as only engrenage's own locations are relocated
/**
 * Rewrites the `@reference` markers of instruction files and the backlog index
 * that name an engrenage fragment by its former location, and warns about each
 * snippet of `agents.snippetsDir` still at a former location.
 */
export async function migrateInstructionLocations(config: {
  filesystem: Filesystem;
  agents: ResolvedAgents;
  reporter: Reporter;
}) {
  const { filesystem } = config;

  await warnFormerSnippets(config);

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
