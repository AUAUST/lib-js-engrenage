import { join, map } from "@auaust/toolkit/iterable";
import { getOwn, keys } from "@auaust/toolkit/object";

import { loadLazy } from "#foundation/modules/index";
import { locateIgnoreFiles } from "#tools/git/operations/locateIgnoreFiles";
import type { DirectiveFill, LoadedConfig } from "#project/config/index";
import type { File } from "#types/File";
import type { GlobGroup } from "#types/GlobGroup";
import type { IgnorePresets } from "#types/IgnorePresets";

const loaded = new WeakMap<LoadedConfig, Map<File, Promise<IgnorePresets>>>();

function renderGroup({ title, globs }: GlobGroup): string {
  return [`# ${title}`, ...globs].join("\n");
}

async function createPresets(
  config: LoadedConfig,
  file: File,
): Promise<IgnorePresets> {
  const located = await locateIgnoreFiles(config);

  const contribution = located.find((ignoreFile) => ignoreFile.file === file);

  if (contribution === undefined) {
    throw new Error("No ignore.files contribution declares the file");
  }

  const create = await loadLazy(contribution.entry);

  return create(config);
}

function loadPresets(config: LoadedConfig, file: File): Promise<IgnorePresets> {
  let files = loaded.get(config);

  if (files === undefined) {
    files = new Map();

    loaded.set(config, files);
  }

  let presets = files.get(file);

  if (presets === undefined) {
    presets = createPresets(config, file);

    files.set(file, presets);
  }

  return presets;
}

/**
 * Fills an `# @ignore <preset>` block with that preset's glob groups, taken from
 * the `ignore.files` contribution whose resource is the file.
 *
 * @throws {Error} The marker names no single preset, or an unknown one.
 */
export const fillIgnoreBlock: DirectiveFill = async ({
  args,
  file,
  config,
}) => {
  const [name, ...others] = args;

  if (name === undefined || others.length > 0) {
    throw new Error("Expected a single preset");
  }

  const presets = await loadPresets(config, file);

  const preset = getOwn(presets, name);

  if (preset === undefined) {
    throw new Error(
      `Unknown preset "${name}", expected one of: ${keys(presets).join(", ")}`,
    );
  }

  return join(map(preset(), renderGroup), "\n\n");
};
