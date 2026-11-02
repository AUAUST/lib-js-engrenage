import { readFileSync } from "node:fs";

import { map } from "@auaust/primitive-kit/arrays";

import { codexFile } from "#agents/codex/constants";
import { syncCodexInstructions } from "#agents/codex/setup/syncCodexInstructions";
import { markdownBlocks } from "#agents/constants";
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

export function syncAgentFiles(config: ResolvedConfig) {
  if ((config.agents.preferred?.length ?? 0) === 0) {
    return;
  }

  const discovered = config.filesystem
    .glob(config.agents.instructionFiles)
    .filter((file) => file !== codexFile);

  function update(content: string, path: File): string {
    return syncBlocks(content, markdownBlocks, {
      reference(reference) {
        if (reference === undefined) {
          throw new Error(`Expected a reference in a marker of ${path}`);
        }

        const source = resolveAgentReference(config, reference, path);

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
