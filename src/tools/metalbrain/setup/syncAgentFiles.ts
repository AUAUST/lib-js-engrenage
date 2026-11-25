import { posix } from "node:path";

import { syncFiles } from "#foundation/blocks/index";
import {
  backlog,
  backlogRecordIndex,
  legacyBacklogIndex,
} from "#metalbrain/backlog/constants";
import {
  migrateBacklogCategories,
  removeLegacyBacklogIndex,
} from "#metalbrain/backlog/index";
import {
  attributionRules,
  mainSharedDirectory,
  mainSharedFiles,
  retiredRules,
} from "#metalbrain/instructions/constants";
import {
  createInstructionFile,
  formatReferenceMarker,
  getRuleReferences,
  getRuleTemplates,
  getSharedFiles,
  listFormerReferences,
  listStaleSkillFiles,
  migrateInstructionLocations,
  removeReferenceBlock,
  syncFrontmatter,
  type FragmentRenderer,
  type GeneratedFrontmatter,
  type InstructionRegistry,
} from "#metalbrain/instructions/index";
import { renameLegacyRecordIds } from "#metalbrain/kinds/index";
import { migrateAgentLogs } from "#metalbrain/logs/index";
import { writeRecordIndex } from "#metalbrain/records/index";
import { skillFileName } from "#metalbrain/runtimes/constants";
import {
  getSkillTemplates,
  hasPreferredAgents,
  migrateSkillFiles,
  removeCodexFiles,
  type ResolvedAgents,
} from "#metalbrain/runtimes/index";
import { jsonIndentation } from "#project/format/constants";
import { loadAgentInputs } from "#tools/metalbrain/operations/loadAgentInputs";
import type { Filesystem } from "#foundation/filesystem/index";
import type { FragmentSources } from "#metalbrain/facts/index";
import type { LoadedConfig } from "#project/config/index";
import type { File } from "#types/File";
import type { FileSync } from "#types/FileSync";

async function syncAttributionRules(config: {
  filesystem: Filesystem;
  agents: ResolvedAgents;
  instructions: InstructionRegistry;
  renderer: FragmentRenderer;
}) {
  const { attribution } = config.agents;

  if (attribution === undefined) {
    return;
  }

  const wanted = attributionRules[`${attribution}`];
  const unwanted = attributionRules[`${!attribution}`];

  const [
    references,
    templates,
  ] = await Promise.all([getRuleReferences(config), getRuleTemplates(config)]);

  // @debt a project file at the wanted rule's path without its reference silently keeps the rule out; sync could report the conflict
  for (const { name, file, reference, content } of templates) {
    const files = references.get(reference) ?? [];

    if (name === unwanted) {
      for (const found of files) {
        await config.filesystem.remove(found);
      }
    } else if (
      name === wanted &&
      files.length === 0 &&
      !(await config.filesystem.exists(file))
    ) {
      await config.filesystem.write(file, content);
    }
  }
}

async function removeRuleBlocks(
  filesystem: Filesystem,
  references: ReadonlyMap<string, readonly File[]>,
  reference: string,
) {
  for (const file of references.get(reference) ?? []) {
    const content = await filesystem.read(file);

    if (content === undefined) {
      continue;
    }

    const remaining = removeReferenceBlock(content, reference);

    await (remaining === undefined
      ? filesystem.remove(file)
      : filesystem.write(file, remaining));
  }
}

// @debt finds only rules still registered, gated off by their condition: an extension removed from the config leaves the rules it contributed installed
async function removeInactiveRules(config: {
  filesystem: Filesystem;
  instructions: InstructionRegistry;
}) {
  const references = await getRuleReferences(config);

  for (const { entry, active, reference } of config.instructions) {
    if (entry.kind === "rule" && !active) {
      await removeRuleBlocks(config.filesystem, references, reference);
    }
  }
}

async function removeRetiredRules(filesystem: Filesystem) {
  const references = await getRuleReferences({ filesystem });

  for (const reference of retiredRules) {
    await removeRuleBlocks(filesystem, references, reference);
  }
}

async function migrateFormerRules(config: {
  filesystem: Filesystem;
  instructions: InstructionRegistry;
  renderer: FragmentRenderer;
}) {
  const [
    references,
    templates,
  ] = await Promise.all([getRuleReferences(config), getRuleTemplates(config)]);

  for (const template of templates) {
    const { file, reference } = template;

    for (const former of listFormerReferences(template)) {
      for (const found of references.get(former) ?? []) {
        const content = await config.filesystem.read(found);

        // @debt a former rule file merged into an existing one loses the project lines it holds outside its block; sync could report them instead
        if (content !== undefined && !(await config.filesystem.exists(file))) {
          await config.filesystem.write(
            file,
            content
              .split(formatReferenceMarker(former))
              .join(formatReferenceMarker(reference)),
          );
        }

        await config.filesystem.remove(found);
      }
    }
  }
}

async function removeStaleSkillFiles(
  filesystem: Filesystem,
  skillFile: File,
  skill: { reference: string; files: readonly { file: File }[] },
) {
  const installed = await filesystem.read(skillFile);

  if (installed?.includes(formatReferenceMarker(skill.reference)) !== true) {
    return;
  }

  for (const file of await listStaleSkillFiles(filesystem, skillFile, skill)) {
    await filesystem.remove(file);
  }
}

async function installMainSharedFiles(config: {
  filesystem: Filesystem;
  fragments: FragmentSources;
  renderer: FragmentRenderer;
}) {
  const shared = await getSharedFiles(config.fragments);

  for (const name of mainSharedFiles) {
    const found = shared.find((file) => file.name === name);

    if (found === undefined) {
      throw new Error(`No origin ships the main session's shared file ${name}`);
    }

    const file = `${mainSharedDirectory}/${name}`;

    const installed = await config.filesystem.read(file);

    if (
      installed !== undefined &&
      !installed.includes(formatReferenceMarker(found.reference))
    ) {
      continue;
    }

    await config.filesystem.write(
      file,
      createInstructionFile({
        reference: found.reference,
        body: await config.renderer.render(found.body, found.source),
      }),
    );
  }
}

/**
 * Syncs agent files when an agent is preferred: migrations, former record IDs
 * renamed, the backlog index, attribution rules, the main session's shared files,
 * generated skill and rule files, removing the Codex files of former releases.
 * The `blocks` target fills their `@reference` blocks.
 */
export async function syncAgentFiles(loaded: LoadedConfig) {
  const { context } = loaded;

  const config = {
    ...(await loadAgentInputs(loaded)),
    reporter: context.reporter,
    resolve: context.path,
    indentation: jsonIndentation,
  };

  if (!hasPreferredAgents(config.agents)) {
    return;
  }

  await migrateInstructionLocations({
    filesystem: config.filesystem,
    reporter: config.reporter,
    instructionFiles: config.agents.instructionFiles,
    snippetsDir: config.agents.snippetsDir,
  });

  await migrateSkillFiles(config);

  await migrateFormerRules(config);

  await removeRetiredRules(config.filesystem);

  await removeCodexFiles(config);

  await migrateBacklogCategories(
    config.filesystem,
    config.agents.instructionFiles,
  );

  // @debt a log stays Markdown, silently, while an instruction file names it, read before this sync fills the instructions: the sync stopping their mention leaves the migration to the next one, and a project whose own rule names a log never learns why it stays
  await migrateAgentLogs(config.filesystem, config.agents.instructionFiles);

  await renameLegacyRecordIds(
    config.filesystem,
    config.agents.instructionFiles,
  );

  const hasBacklog = (
    (await config.filesystem.exists(backlogRecordIndex)) ||
    (await config.filesystem.exists(legacyBacklogIndex))
  );

  await removeLegacyBacklogIndex(config.filesystem);

  if (hasBacklog) {
    await writeRecordIndex(config.filesystem, backlog);
  }

  await syncAttributionRules(config);

  await removeInactiveRules(config);

  await installMainSharedFiles(config);

  // @debt sync cannot tell a deleted extension default rule from one shipped after the project's init, so an upgrading project gets only a hint and installs the new rule by hand
  const generated: FileSync[] = [];

  function generate(
    file: File,
    reference: string,
    frontmatter: GeneratedFrontmatter,
  ) {
    generated.push({
      file,
      update(current, path) {
        if (!current.includes(formatReferenceMarker(reference))) {
          return current;
        }

        return syncFrontmatter(current, frontmatter, path);
      },
    });
  }

  for (const template of await getSkillTemplates(config)) {
    const { reference, files: skillFiles } = template;

    for (const { file, content, frontmatter, skillFile } of skillFiles) {
      if (posix.basename(file) === skillFileName) {
        await removeStaleSkillFiles(config.filesystem, file, template);
      }

      if (skillFile !== undefined) {
        const installed = await config.filesystem.read(skillFile);

        if (installed?.includes(formatReferenceMarker(reference)) === true) {
          await config.filesystem.write(file, content);
        }
      } else if (frontmatter === undefined) {
        generated.push({
          file,
          update() {
            return content;
          },
        });
      } else {
        generate(file, reference, frontmatter);
      }
    }
  }

  for (const { file, reference, frontmatter } of await getRuleTemplates(
    config,
  )) {
    generate(file, reference, frontmatter);
  }

  await syncFiles(config, generated);
}
