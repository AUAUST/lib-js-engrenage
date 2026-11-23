import { readFile } from "node:fs/promises";

import {
  getRegisteredTemplates,
  getSharedFiles,
  parseInstruction,
  resolveAgentReference,
} from "#metalbrain/instructions/index";
import { getAgentRuntimes } from "#tools/metalbrain/operations/getAgentRuntimes";
import { loadFragmentRenderer } from "#tools/metalbrain/operations/loadFragmentRenderer";
import { loadInstructionRegistry } from "#tools/metalbrain/operations/loadInstructionRegistry";
import { loadMetalbrainFacts } from "#tools/metalbrain/operations/loadMetalbrainFacts";
import type { DirectiveFill, LoadedConfig } from "#project/config/index";
import type { Directory } from "#types/Directory";
import type { File } from "#types/File";

interface ShippedSkill {
  readonly skill: string;
  readonly files: readonly string[];
  readonly shared: readonly string[];
}

const loadedSkills = new WeakMap<
  LoadedConfig,
  Promise<ReadonlyMap<string, ShippedSkill>>
>();

async function indexSkills(
  config: LoadedConfig,
): Promise<ReadonlyMap<string, ShippedSkill>> {
  const [{ fragments }, instructions] = await Promise.all([
    loadMetalbrainFacts(config),
    loadInstructionRegistry(config),
  ]);

  const templates = await getRegisteredTemplates("skill", {
    instructions,
    supporting: true,
  });

  const sharedFiles = await getSharedFiles(fragments);

  const shared = sharedFiles.map(({ name }) => name);

  const skills = new Map<string, ShippedSkill>();

  for (const { name, reference, supporting } of templates) {
    const skill = {
      skill: name,
      files: supporting.map((supported) => supported.name),
      shared,
    };

    for (const shipped of [
      reference,
      ...supporting.map((supported) => supported.reference),
    ]) {
      skills.set(shipped, skill);
    }
  }

  return skills;
}

function loadSkills(
  config: LoadedConfig,
): Promise<ReadonlyMap<string, ShippedSkill>> {
  let skills = loadedSkills.get(config);

  if (skills === undefined) {
    skills = indexSkills(config);

    loadedSkills.set(config, skills);
  }

  return skills;
}

async function findRuntimeSkills(
  config: LoadedConfig,
  file: File,
): Promise<Directory | undefined> {
  const runtimes = await getAgentRuntimes(config);

  return runtimes.find(({ skills, agents }) => {
    return [skills, agents].some((directory) => {
      return directory !== undefined && file.startsWith(`${directory}/`);
    });
  })?.skills;
}

async function findReference(
  config: LoadedConfig,
  reference: string,
  file: File,
): Promise<File | undefined> {
  try {
    return await resolveAgentReference(
      {
        resolve: config.context.path,
        agents: await config.resolve("agents"),
      },
      reference,
      config.context.path(file),
    );
  } catch (error) {
    if (!(error instanceof Error)) {
      throw error;
    }

    config.context.reporter.warn(
      `${error.message}: its block is left untouched`,
    );
  }
}

/**
 * Fills a `<!-- @reference <reference> -->` block with the rendered body of the
 * instruction fragment the reference resolves to. A reference that cannot be
 * resolved leaves its block untouched and logs a warning. A skill's fragments, or
 * the snippets overriding them, filled in a runtime's skills or agents directory
 * also render `@skill-file` and `@shared-file`.
 *
 * @throws {Error} The marker names no single reference.
 */
export const fillReferenceBlock: DirectiveFill = async ({
  args,
  file,
  config,
}) => {
  const [reference, ...others] = args;

  if (reference === undefined || others.length > 0) {
    throw new Error("Expected a reference");
  }

  const source = await findReference(config, reference, file);

  if (source === undefined) {
    return;
  }

  const content = await readFile(source, "utf-8");

  const body = parseInstruction(content, source).body;

  const renderer = await loadFragmentRenderer(config);

  const skillsDirectory = await findRuntimeSkills(config, file);

  const skills = skillsDirectory === undefined
    ? undefined
    : await loadSkills(config);

  const shipped = skills?.get(reference);

  return renderer.render(
    body,
    source,
    skillsDirectory === undefined || shipped === undefined
      ? undefined
      : { directory: skillsDirectory, ...shipped },
  );
};
