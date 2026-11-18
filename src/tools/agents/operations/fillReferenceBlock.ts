import { readFile } from "node:fs/promises";

import { createAgentFillers } from "#tools/agents/operations/createAgentFillers";
import { parseInstruction } from "#tools/agents/operations/parseInstruction";
import { resolveAgentReference } from "#tools/agents/operations/resolveAgentReference";
import { renderFragment } from "#tools/agents/utils/renderFragment";
import type { DirectiveFill, LoadedConfig } from "#project/config/index";
import type { BlockFillers } from "#types/BlockFillers";
import type { File } from "#types/File";

const loaded = new WeakMap<LoadedConfig, Promise<BlockFillers>>();

function loadFillers(config: LoadedConfig): Promise<BlockFillers> {
  let fillers = loaded.get(config);

  if (fillers === undefined) {
    fillers = createAgentFillers(config);

    loaded.set(config, fillers);
  }

  return fillers;
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

    console.warn(`${error.message}: its block is left untouched`);
  }
}

/**
 * Fills a `<!-- @reference <reference> -->` block with the rendered body of the
 * instruction fragment the reference resolves to. A reference that cannot be
 * resolved leaves its block untouched and logs a warning.
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

  return renderFragment(
    parseInstruction(content, source).body,
    source,
    await loadFillers(config),
  );
};
