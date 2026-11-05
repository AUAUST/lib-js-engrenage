import { readFileSync } from "node:fs";

import { map } from "@auaust/primitive-kit/arrays";

import { syncBlocks, syncFiles } from "#foundation/blocks/index";
import { codexFile } from "#tools/agents/codex/constants";
import { syncCodexInstructions } from "#tools/agents/codex/index";
import { attributionRules, markdownBlocks } from "#tools/agents/constants";
import { getRuleReferences } from "#tools/agents/operations/getRuleReferences";
import { getRuleTemplates } from "#tools/agents/operations/getRuleTemplates";
import { getSkillTemplates } from "#tools/agents/operations/getSkillTemplates";
import { parseInstruction } from "#tools/agents/operations/parseInstruction";
import { resolveAgentReference } from "#tools/agents/operations/resolveAgentReference";
import { syncFrontmatter } from "#tools/agents/operations/syncFrontmatter";
import type { Filesystem } from "#foundation/filesystem/index";
import type { GeneratedFrontmatter } from "#tools/agents/types/GeneratedFrontmatter";
import type { ResolvedAgents } from "#tools/agents/types/ResolvedAgents";
import type { File } from "#types/File";
import type { FileSync } from "#types/FileSync";

function syncAttributionRules(config: {
  filesystem: Filesystem;
  agents: ResolvedAgents;
}) {
  const { attribution } = config.agents;

  if (attribution === undefined) {
    return;
  }

  const wanted = attributionRules[`${attribution}`];
  const unwanted = attributionRules[`${!attribution}`];
  const references = getRuleReferences(config);

  // @debt a project file at the wanted rule's path without its reference silently keeps the rule out; sync could report the conflict
  for (const { name, file, reference, content } of getRuleTemplates()) {
    const files = references.get(reference) ?? [];

    if (name === unwanted) {
      for (const found of files) {
        config.filesystem.remove(found);
      }
    } else if (
      name === wanted &&
      files.length === 0 &&
      !config.filesystem.exists(file)
    ) {
      config.filesystem.write(file, content);
    }
  }
}

export function syncAgentFiles(config: {
  filesystem: Filesystem;
  resolve(...paths: string[]): string;
  agents: ResolvedAgents;
}) {
  if ((config.agents.preferred?.length ?? 0) === 0) {
    return;
  }

  syncAttributionRules(config);

  const discovered = config.filesystem
    .glob(config.agents.instructionFiles)
    .filter((file) => file !== codexFile);

  function findReference(reference: string, path: File): File | undefined {
    try {
      return resolveAgentReference(config, reference, path);
    } catch (error) {
      if (!(error instanceof Error)) {
        throw error;
      }

      console.warn(`${error.message}: its block is left untouched`);
    }
  }

  function update(content: string, path: File): string {
    return syncBlocks(content, markdownBlocks, {
      reference(reference) {
        if (reference === undefined) {
          throw new Error(`Expected a reference in a marker of ${path}`);
        }

        const source = findReference(reference, path);

        if (source !== undefined) {
          return parseInstruction(readFileSync(source, "utf-8"), source).body;
        }
      },
    });
  }

  const files = map(discovered, (file) => {
    return {
      file,
      update,
    };
  });

  const generated: FileSync[] = [];

  function generate(
    file: File,
    reference: string,
    frontmatter: GeneratedFrontmatter,
  ) {
    generated.push({
      file,
      update(current, path) {
        if (!current.includes(`<!-- @reference ${reference} -->`)) {
          return current;
        }

        return syncFrontmatter(current, frontmatter, path);
      },
    });
  }

  for (const { reference, files: skillFiles } of getSkillTemplates(config)) {
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

  for (const { file, reference, frontmatter } of getRuleTemplates()) {
    generate(file, reference, frontmatter);
  }

  syncFiles(config, generated);
  syncFiles(config, files);
  syncCodexInstructions(config);
}
