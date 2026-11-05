import { readFile } from "node:fs/promises";

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
import type { OptionContext } from "#foundation/options/index";
import type { AgentSections } from "#tools/agents/types/AgentSections";
import type { GeneratedFrontmatter } from "#tools/agents/types/GeneratedFrontmatter";
import type { ResolvedAgents } from "#tools/agents/types/ResolvedAgents";
import type { File } from "#types/File";
import type { FileSync } from "#types/FileSync";

async function syncAttributionRules(config: {
  filesystem: Filesystem;
  agents: ResolvedAgents;
}) {
  const { attribution } = config.agents;

  if (attribution === undefined) {
    return;
  }

  const wanted = attributionRules[`${attribution}`];
  const unwanted = attributionRules[`${!attribution}`];

  const [references, templates] = await Promise.all([
    getRuleReferences(config),
    getRuleTemplates(),
  ]);

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

export async function syncAgentFiles({ get }: OptionContext<AgentSections>) {
  const config = {
    filesystem: await get("filesystem"),
    resolve: await get("resolve"),
    agents: await get("agents"),
  };

  if ((config.agents.preferred?.length ?? 0) === 0) {
    return;
  }

  await syncAttributionRules(config);

  const instructionFiles = await config.filesystem.glob(
    config.agents.instructionFiles,
  );

  const discovered = instructionFiles.filter((file) => file !== codexFile);

  async function findReference(
    reference: string,
    path: File,
  ): Promise<File | undefined> {
    try {
      return await resolveAgentReference(config, reference, path);
    } catch (error) {
      if (!(error instanceof Error)) {
        throw error;
      }

      console.warn(`${error.message}: its block is left untouched`);
    }
  }

  async function readReferences(): Promise<ReadonlyMap<string, string>> {
    const bodies = new Map<string, string>();

    await Promise.all(
      discovered.map(async (file) => {
        const content = await config.filesystem.read(file);

        if (content === undefined) {
          return;
        }

        const path = config.resolve(file);
        const referenced = new Set<string>();

        syncBlocks(content, markdownBlocks, {
          reference(reference) {
            if (reference === undefined) {
              throw new Error(`Expected a reference in a marker of ${path}`);
            }

            referenced.add(reference);
          },
        });

        await Promise.all(
          [...referenced].map(async (reference) => {
            const source = await findReference(reference, path);

            if (source !== undefined) {
              bodies.set(
                `${path}\0${reference}`,
                parseInstruction(await readFile(source, "utf-8"), source).body,
              );
            }
          }),
        );
      }),
    );

    return bodies;
  }

  function createUpdate(bodies: ReadonlyMap<string, string>) {
    return function update(content: string, path: File): string {
      return syncBlocks(content, markdownBlocks, {
        reference(reference) {
          if (reference === undefined) {
            throw new Error(`Expected a reference in a marker of ${path}`);
          }

          return bodies.get(`${path}\0${reference}`);
        },
      });
    };
  }

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

  for (const { reference, files: skillFiles } of await getSkillTemplates(
    config,
  )) {
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

  for (const { file, reference, frontmatter } of await getRuleTemplates()) {
    generate(file, reference, frontmatter);
  }

  await syncFiles(config, generated);

  const update = createUpdate(await readReferences());

  await syncFiles(
    config,
    map(discovered, (file) => {
      return {
        file,
        update,
      };
    }),
  );

  await syncCodexInstructions(config);
}
