import { syncFiles } from "#foundation/blocks/index";
import { syncCodexInstructions } from "#tools/agents/codex/index";
import { attributionRules } from "#tools/agents/constants";
import { createAgentFillers } from "#tools/agents/operations/createAgentFillers";
import { getRuleReferences } from "#tools/agents/operations/getRuleReferences";
import { getRuleTemplates } from "#tools/agents/operations/getRuleTemplates";
import { getSkillTemplates } from "#tools/agents/operations/getSkillTemplates";
import { listActiveExtensions } from "#tools/agents/operations/listActiveExtensions";
import { migrateSkillFiles } from "#tools/agents/operations/migrateSkillFiles";
import { syncFrontmatter } from "#tools/agents/operations/syncFrontmatter";
import { formatReferenceMarker } from "#tools/agents/utils/formatReferenceMarker";
import { listFormerReferences } from "#tools/agents/utils/listFormerReferences";
import type { Filesystem } from "#foundation/filesystem/index";
import type { Extension, LoadedConfig } from "#project/config/index";
import type { GeneratedFrontmatter } from "#tools/agents/types/GeneratedFrontmatter";
import type { ResolvedAgents } from "#tools/agents/types/ResolvedAgents";
import type { BlockFillers } from "#types/BlockFillers";
import type { File } from "#types/File";
import type { FileSync } from "#types/FileSync";

async function syncAttributionRules(config: {
  filesystem: Filesystem;
  agents: ResolvedAgents;
  fillers: BlockFillers;
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

async function migrateFormerRules(config: {
  filesystem: Filesystem;
  extensions: readonly Extension[];
  fillers: BlockFillers;
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

/**
 * Syncs agent files when an agent is preferred: migrations, attribution rules,
 * generated skill and rule files and Codex instructions. The `blocks` target
 * fills their `@reference` blocks.
 */
export async function syncAgentFiles(loaded: LoadedConfig) {
  const { resolve, context } = loaded;

  const config = {
    filesystem: context.filesystem,
    resolve: context.path,
    agents: await resolve("agents"),
    extensions: await listActiveExtensions(loaded),
    fillers: await createAgentFillers(loaded),
  };

  if ((config.agents.preferred?.length ?? 0) === 0) {
    return;
  }

  await migrateSkillFiles(config);

  await migrateFormerRules(config);

  await syncAttributionRules(config);

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

    for (const { file, content, frontmatter } of skillFiles) {
      if (frontmatter === undefined) {
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

  await syncCodexInstructions(config);
}
