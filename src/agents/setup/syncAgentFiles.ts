import { readFileSync } from "node:fs";

import { map } from "@auaust/primitive-kit/arrays";

import { codexFile } from "#agents/codex/constants";
import { syncCodexInstructions } from "#agents/codex/setup/syncCodexInstructions";
import { attributionRules, markdownBlocks } from "#agents/constants";
import { getRuleReferences } from "#agents/utils/getRuleReferences";
import { getRuleTemplates } from "#agents/utils/getRuleTemplates";
import { getSkillTemplates } from "#agents/utils/getSkillTemplates";
import { parseInstruction } from "#agents/utils/parseInstruction";
import { resolveAgentReference } from "#agents/utils/resolveAgentReference";
import { syncFrontmatter } from "#agents/utils/syncFrontmatter";
import { syncBlocks } from "#utils/syncBlocks";
import { syncFiles } from "#utils/syncFiles";
import type { GeneratedFrontmatter } from "#agents/types/GeneratedFrontmatter";
import type { ResolvedConfig } from "#config/types/ResolvedConfig";
import type { File } from "#types/File";
import type { FileSync } from "#types/FileSync";

function syncAttributionRules(config: ResolvedConfig) {
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

export function syncAgentFiles(config: ResolvedConfig) {
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

        if (source === undefined) {
          return;
        }

        return parseInstruction(readFileSync(source, "utf-8"), source).body;
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
