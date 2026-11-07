import { mkdir } from "node:fs/promises";

import { includes } from "@auaust/primitive-kit/arrays";
import type { Maybe } from "@auaust/toolkit/types";

import { packages } from "#constants";
import { resolveWithin } from "#foundation/filesystem/index";
import { resolveBinary, spawnProcess } from "#foundation/processes/index";
import { cacheSection } from "#project/cache/index";
import { baselineFile } from "#tools/jscpd/constants";
import { listScannedFiles } from "#tools/jscpd/operations/listScannedFiles";
import type { LoadedConfig } from "#project/config/index";
import type { Files } from "#types/Files";

const newClonesStatus = 1;

export async function reportClones(
  config: LoadedConfig,
  files: Files,
): Promise<Maybe<string>> {
  const { root } = config.context;

  const scanned = await listScannedFiles(config);

  if (!files.some((file) => includes(scanned, file))) {
    return;
  }

  const cache = await config.resolve(cacheSection);

  const directory = resolveWithin(root, cache.for(packages.jscpd));

  await mkdir(directory, { recursive: true });

  // @debt jscpd reports the new clones of every file git lists as changed, not only of `files`
  const { status, stdout, stderr, error } = await spawnProcess(
    process.execPath,
    [
      await resolveBinary(root, packages.jscpd, packages.jscpd),
      "--changed",
      "--baseline",
      resolveWithin(directory, baselineFile),
      "--fail-on-new-clones=0",
      "--reporters",
      "ai",
      "--no-colors",
      "--no-tips",
      ...scanned,
    ],
    { cwd: root },
  );

  if (error === undefined && status === 0) {
    return;
  }

  if (error === undefined && status === newClonesStatus) {
    return stdout;
  }

  throw new Error(`jscpd failed:\n${error?.message ?? stdout + stderr}`);
}
