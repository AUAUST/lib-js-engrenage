import { iterable } from "@auaust/toolkit";

import {
  createFilesystem,
  createGlobMatcher,
} from "#foundation/filesystem/index";
import { listGenerators } from "#project/generators/operations/listGenerators";
import { runGenerator } from "#project/generators/operations/runGenerator";
import type { LoadedConfig } from "#project/config/index";
import type { GateResult } from "#project/gate/index";
import type { ResolvedGenerator } from "#project/generators/types/ResolvedGenerator";
import type { Directory } from "#types/Directory";
import type { File } from "#types/File";
import type { Files } from "#types/Files";

async function readOutputs(
  root: Directory,
  { outputs }: ResolvedGenerator,
): Promise<ReadonlyMap<File, string | undefined>> {
  const filesystem = createFilesystem(root);

  const files = await filesystem.glob(outputs);

  return new Map(
    await Promise.all(
      iterable.map(files, async (file) => {
        return [file, await filesystem.read(file)] as const;
      }),
    ),
  );
}

function listChangedOutputs(
  before: ReadonlyMap<File, string | undefined>,
  after: ReadonlyMap<File, string | undefined>,
): Files {
  const files = new Set([...before.keys(), ...after.keys()]);

  return [...files]
    .filter((file) => {
      return before.get(file) !== after.get(file);
    })
    .sort();
}

/**
 * Runs every generator of the project in declaration order, stopping at the first
 * that fails or that changes, adds or removes an output Git does not ignore,
 * naming the result after it.
 */
export async function regenerateAll(config: LoadedConfig): Promise<GateResult> {
  const { root } = config.context;

  for (const generator of await listGenerators(config)) {
    const before = await readOutputs(root, generator);

    const result = await runGenerator(root, generator);

    if (!result.ok) {
      return result;
    }

    const after = await readOutputs(root, generator);

    const changed = listChangedOutputs(before, after);

    if (changed.length === 0) {
      continue;
    }

    const git = await config.resolve("git");

    const isIgnored = createGlobMatcher(await git.ignored);

    const outdated = changed.filter((file) => !isIgnored(file));

    if (outdated.length > 0) {
      return {
        ok: false,
        output: `Outputs out of date with their inputs, regenerated; commit them:\n${outdated.join("\n")}`,
        name: generator.name,
      };
    }
  }

  return { ok: true, output: "" };
}
