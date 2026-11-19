import { posix } from "node:path";

import { syncFiles } from "#foundation/blocks/index";
import { syncCodexInstructions } from "#tools/agents/codex/index";
import {
  attributionRules,
  backlogCategoriesHeading,
  backlogIndex,
  backlogTemplate,
  skillFileName,
} from "#tools/agents/constants";
import { createFragmentRenderer } from "#tools/agents/operations/createFragmentRenderer";
import { getAgentRuntimes } from "#tools/agents/operations/getAgentRuntimes";
import { getInstructionTemplates } from "#tools/agents/operations/getInstructionTemplates";
import { getRuleReferences } from "#tools/agents/operations/getRuleReferences";
import { getRuleTemplates } from "#tools/agents/operations/getRuleTemplates";
import { getSkillTemplates } from "#tools/agents/operations/getSkillTemplates";
import { listActiveExtensions } from "#tools/agents/operations/listActiveExtensions";
import { listStaleSkillFiles } from "#tools/agents/operations/listStaleSkillFiles";
import { migrateInstructionLocations } from "#tools/agents/operations/migrateInstructionLocations";
import { migrateSkillFiles } from "#tools/agents/operations/migrateSkillFiles";
import { removeReferenceBlock } from "#tools/agents/operations/removeReferenceBlock";
import { syncFrontmatter } from "#tools/agents/operations/syncFrontmatter";
import { formatBacklogIndex } from "#tools/agents/utils/formatBacklogIndex";
import { formatReferenceMarker } from "#tools/agents/utils/formatReferenceMarker";
import { hasPreferredAgents } from "#tools/agents/utils/hasPreferredAgents";
import { listFormerReferences } from "#tools/agents/utils/listFormerReferences";
import type { Filesystem } from "#foundation/filesystem/index";
import type { Extension, LoadedConfig } from "#project/config/index";
import type { FragmentRenderer } from "#tools/agents/types/FragmentRenderer";
import type { GeneratedFrontmatter } from "#tools/agents/types/GeneratedFrontmatter";
import type { ResolvedAgents } from "#tools/agents/types/ResolvedAgents";
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

    for (const file of references.get(reference) ?? []) {
      const content = await config.filesystem.read(file);

      if (content === undefined) {
        continue;
      }

      const remaining = removeReferenceBlock(content, reference);

      await (remaining === undefined
        ? config.filesystem.remove(file)
        : config.filesystem.write(file, remaining));
    }
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

async function migrateBacklogIndex(filesystem: Filesystem) {
  const content = await filesystem.read(backlogIndex);

  if (
    content === undefined ||
    content.includes(formatReferenceMarker(backlogTemplate))
  ) {
    return;
  }

  const lines = content.split("\n");
  const heading = lines.indexOf(backlogCategoriesHeading);

  if (heading === -1) {
    throw new Error(
      `${backlogIndex} has no "${backlogCategoriesHeading}" heading: add it below the instructions so sync can own them`,
    );
  }

  await filesystem.write(
    backlogIndex,
    formatBacklogIndex(lines[0] ?? "", lines.slice(heading + 1)),
  );
}

/**
 * Syncs agent files when an agent is preferred: migrations, attribution rules,
 * generated skill and rule files and Codex instructions. The `blocks` target
 * fills their `@reference` blocks.
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
  };

  if (!hasPreferredAgents(config.agents)) {
    return;
  }

  await migrateInstructionLocations(config);

  await migrateSkillFiles(config);

  await migrateFormerRules(config);

  await migrateBacklogIndex(config.filesystem);

  await syncAttributionRules(config);

  await removeInactiveExtensionRules(config);

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

  await syncCodexInstructions({ ...config, config: loaded });
}
