import { listReferenceFiles } from "#metalbrain/instructions/operations/listReferenceFiles";
import { formatReferenceMarker } from "#metalbrain/instructions/utils/formatReferenceMarker";
import { listReferences } from "#metalbrain/instructions/utils/listReferences";
import { relocateInstructionReference } from "#metalbrain/instructions/utils/relocateInstructionReference";
import type { Filesystem } from "#foundation/filesystem/index";
import type { Reporter } from "#foundation/reports/index";
import type { Directory } from "#types/Directory";
import type { Globs } from "#types/Globs";

// @debt a snippet named after a fragment's `formerly` name, a renamed rule or skill, stays silent although no marker names it anymore
async function warnFormerSnippets(config: {
  filesystem: Filesystem;
  snippetsDir: Directory | undefined;
  reporter: Reporter;
}) {
  const { snippetsDir } = config;

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
  instructionFiles: Globs;
  snippetsDir: Directory | undefined;
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
