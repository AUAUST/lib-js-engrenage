import { iterable } from "@auaust/toolkit";

import { createGlobMatcher } from "#foundation/filesystem/index";
import { listGenerators } from "#project/generators/operations/listGenerators";
import { runGenerators } from "#project/generators/operations/runGenerators";
import type { LoadedConfig } from "#project/config/index";
import type { GateResult } from "#project/gate/index";
import type { ResolvedGenerator } from "#project/generators/types/ResolvedGenerator";
import type { Files } from "#types/Files";

async function isStale(
  config: LoadedConfig,
  { inputs, outputs }: ResolvedGenerator,
  touched: Files,
): Promise<boolean> {
  if (touched.some(createGlobMatcher(inputs))) {
    return true;
  }

  const { filesystem } = config.context;

  const matched = await Promise.all(
    iterable.map(outputs, async (output) => {
      const files = await filesystem.glob(output);

      return files.length > 0;
    }),
  );

  return matched.includes(false);
}

/**
 * Runs, in declaration order, each generator whose inputs match a changed or
 * removed file, or one of whose outputs matches no file.
 */
export async function regenerateChanged(
  config: LoadedConfig,
  files: Files,
  removed: Files,
): Promise<GateResult> {
  const generators = await listGenerators(config);

  const touched = [...files, ...removed];

  const stale = await Promise.all(
    iterable.map(generators, (generator) => {
      return isStale(config, generator, touched);
    }),
  );

  return runGenerators(
    config.context.root,
    generators.filter((_generator, index) => stale[index]),
  );
}
