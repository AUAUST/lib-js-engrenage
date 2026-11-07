import { mkdir, readFile } from "node:fs/promises";
import { relative } from "node:path";

import {
  array,
  boolean,
  number,
  object,
  parse,
  string,
  type InferOutput,
} from "valibot";

import { includes, map } from "@auaust/primitive-kit/arrays";

import { packages } from "#constants";
import { resolveWithin, toPosixPath } from "#foundation/filesystem/index";
import { parseJson } from "#foundation/json/index";
import { resolveBinary, spawnProcess } from "#foundation/processes/index";
import { cacheSection } from "#project/cache/index";
import { baselineFile, reportFile } from "#tools/jscpd/constants";
import { listScannedFiles } from "#tools/jscpd/operations/listScannedFiles";
import type { LoadedConfig } from "#project/config/index";
import type { Clone } from "#tools/jscpd/types/Clone";
import type { CloneFragment } from "#tools/jscpd/types/CloneFragment";
import type { Directory } from "#types/Directory";
import type { Files } from "#types/Files";

const fragmentSchema = object({
  name: string(),
  start: number(),
  end: number(),
});

const reportSchema = object({
  duplicates: array(
    object({
      firstFile: fragmentSchema,
      secondFile: fragmentSchema,
      lines: number(),
      isNew: boolean(),
    }),
  ),
});

function toFragment(
  root: Directory,
  { name, start, end }: InferOutput<typeof fragmentSchema>,
): CloneFragment {
  return {
    file: toPosixPath(relative(root, name)),
    start,
    end,
  };
}

async function runJscpd(
  root: Directory,
  directory: Directory,
  scanned: Files,
): Promise<unknown> {
  const { status, stdout, stderr, error } = await spawnProcess(
    process.execPath,
    [
      await resolveBinary(root, packages.jscpd, packages.jscpd),
      "--changed",
      "--baseline",
      resolveWithin(directory, baselineFile),
      "--reporters",
      "json",
      "--output",
      directory,
      "--silent",
      "--no-tips",
      "--absolute",
      ...scanned,
    ],
    { cwd: root },
  );

  if (error !== undefined || status !== 0) {
    throw new Error(`jscpd failed:\n${error?.message ?? stdout + stderr}`);
  }

  const report = resolveWithin(directory, reportFile);

  return parseJson(await readFile(report, "utf-8"), report);
}

export async function findClones(
  config: LoadedConfig,
  files: Files,
): Promise<Clone[]> {
  const { root } = config.context;

  const scanned = await listScannedFiles(config);

  if (!files.some((file) => includes(scanned, file))) {
    return [];
  }

  const cache = await config.resolve(cacheSection);

  const directory = resolveWithin(root, cache.for(packages.jscpd));

  await mkdir(directory, { recursive: true });

  const { duplicates } = parse(
    reportSchema,
    await runJscpd(root, directory, scanned),
  );

  const clones = map(
    duplicates.filter(({ isNew }) => isNew),
    ({ firstFile, secondFile, lines }): Clone => {
      return {
        lines,
        fragments: [toFragment(root, firstFile), toFragment(root, secondFile)],
      };
    },
  );

  return clones.filter(({ fragments }) => {
    return fragments.some(({ file }) => includes(files, file));
  });
}
