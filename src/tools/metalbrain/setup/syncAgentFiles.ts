import { posix } from "node:path";

import { syncFiles } from "#foundation/blocks/index";
import { backlog, backlogIndex } from "#metalbrain/backlog/constants";
import { migrateBacklogCategories } from "#metalbrain/backlog/index";
import {
  createInstructionFile,
  formatReferenceMarker,
  getRuleReferences,
  listFormerReferences,
  listStaleSkillFiles,
  migrateBacklogIndex,
  migrateInstructionLocations,
  removeReferenceBlock,
  syncFrontmatter,
  type FragmentRenderer,
  type GeneratedFrontmatter,
} from "#metalbrain/instructions/index";
import { writeRecordIndex } from "#metalbrain/records/index";
import {
  hasPreferredAgents,
  removeCodexFiles,
  type ResolvedAgents,
} from "#metalbrain/runtimes/index";
import { jsonIndentation } from "#project/format/constants";
import {
  attributionRules,
  mainSharedDirectory,
  mainSharedFiles,
  retiredRules,
  skillFileName,
} from "#tools/agents/constants";
import {
  createFragmentRenderer,
  getAgentRuntimes,
  getInstructionTemplates,
  getRuleTemplates,
  getSharedFiles,
  getSkillTemplates,
  listActiveExtensions,
  migrateSkillFiles,
} from "#tools/agents/index";
import { hookRoots } from "#tools/metalbrain/constants";
import type { Filesystem } from "#foundation/filesystem/index";
import type { Extension, LoadedConfig } from "#project/config/index";
import type { File } from "#types/File";
import type { FileSync } from "#types/FileSync";

async function syncAttributionRules(config: {
  filesystem: Filesystem;
  agents: ResolvedAgents;
  extensions: readonly Extension[];
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

// @debt finds only rules of origins still configured, gated off by `extension` metadata: an extension removed from the config leaves its rules installed
async function removeInactiveExtensionRules(config: {
  filesystem: Filesystem;
  extensions: readonly Extension[];
}) {
  const active = new Set(
    config.extensions.map(({ name }) => {
      return name;
    }),
  );

  const [references, templates] = await Promise.all([
    getRuleReferences(config),
    getInstructionTemplates("rules", {
      extensions: config.extensions,
      inactive: true,
    }),
  ]);

  for (const { extension, reference } of templates) {
    if (extension === undefined || active.has(extension)) {
      continue;
    }

    await removeRuleBlocks(config.filesystem, references, reference);
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
  extensions: readonly Extension[];
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
  extensions: readonly Extension[];
  renderer: FragmentRenderer;
}) {
  const shared = await getSharedFiles(config.extensions);

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
 * Syncs agent files when an agent is preferred: migrations, the backlog index,
 * attribution rules, the main session's shared files, generated skill and rule
 * files, removing the Codex files of former releases. The `blocks` target fills
 * their `@reference` blocks.
 */
export async function syncAgentFiles(loaded: LoadedConfig) {
  const { resolve, context } = loaded;

  const config = {
    filesystem: context.filesystem,
    reporter: context.reporter,
    resolve: context.path,
    agents: await resolve("agents"),
    extensions: await listActiveExtensions(loaded),
    renderer: await createFragmentRenderer(loaded),
    runtimes: await getAgentRuntimes(loaded),
    roots: hookRoots,
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
    new Date(),
    config.agents.instructionFiles,
  );

  await migrateBacklogIndex(config.filesystem);

  if (await config.filesystem.exists(backlogIndex)) {
    await writeRecordIndex(config.filesystem, backlog);
  }

  await syncAttributionRules(config);

  await removeInactiveExtensionRules(config);

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
