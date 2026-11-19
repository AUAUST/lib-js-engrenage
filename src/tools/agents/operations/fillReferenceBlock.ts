import { readFile } from "node:fs/promises";

import {
  claudeAgentsDir,
  claudeSkillsDir,
} from "#tools/agents/claude/constants";
import { codexSkillsDir } from "#tools/agents/codex/constants";
import { createAgentFillers } from "#tools/agents/operations/createAgentFillers";
import { getInstructionTemplates } from "#tools/agents/operations/getInstructionTemplates";
import { listActiveExtensions } from "#tools/agents/operations/listActiveExtensions";
import { parseInstruction } from "#tools/agents/operations/parseInstruction";
import { resolveAgentReference } from "#tools/agents/operations/resolveAgentReference";
import { createSkillFileFiller } from "#tools/agents/utils/createSkillFileFiller";
import { renderFragment } from "#tools/agents/utils/renderFragment";
import type { DirectiveFill, LoadedConfig } from "#project/config/index";
import type { BlockFillers } from "#types/BlockFillers";
import type { Directory } from "#types/Directory";
import type { File } from "#types/File";

interface ShippedSkill {
  readonly skill: string;
  readonly files: readonly string[];
}

const loaded = new WeakMap<LoadedConfig, Promise<BlockFillers>>();

const loadedSkills = new WeakMap<
  LoadedConfig,
  Promise<ReadonlyMap<string, ShippedSkill>>
>();

function loadFillers(config: LoadedConfig): Promise<BlockFillers> {
  let fillers = loaded.get(config);

  if (fillers === undefined) {
    fillers = createAgentFillers(config);

    loaded.set(config, fillers);
  }

  return fillers;
}

async function indexSkills(
  config: LoadedConfig,
): Promise<ReadonlyMap<string, ShippedSkill>> {
  const templates = await getInstructionTemplates("skills", {
    extensions: await listActiveExtensions(config),
    supporting: true,
  });

  const skills = new Map<string, ShippedSkill>();

  for (const { name, reference, supporting } of templates) {
    const skill = {
      skill: name,
      files: supporting.map((supported) => supported.name),
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

// @debt each runtime's skills and agents directories are matched by hand instead of declared by its `agents.runtimes` contribution
function findSkillsDirectory(file: File): Directory | undefined {
  if (
    file.startsWith(`${claudeSkillsDir}/`) ||
    file.startsWith(`${claudeAgentsDir}/`)
  ) {
    return claudeSkillsDir;
  }

  if (file.startsWith(`${codexSkillsDir}/`)) {
    return codexSkillsDir;
  }
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
 * also render `@skill-file`.
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

  const fillers = await loadFillers(config);

  const skillsDirectory = findSkillsDirectory(file);

  if (skillsDirectory === undefined) {
    return renderFragment(body, source, fillers);
  }

  const skills = await loadSkills(config);

  const shipped = skills.get(reference);

  return renderFragment(
    body,
    source,
    shipped === undefined
      ? fillers
      : {
          ...fillers,
          "skill-file": createSkillFileFiller({
            directory: skillsDirectory,
            ...shipped,
          }),
        },
  );
};
