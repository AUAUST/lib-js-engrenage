import { mkdir } from "node:fs/promises";
import { relative } from "node:path";

import { array, boolean, number, object, string } from "valibot";

import { includes } from "@auaust/primitive-kit/arrays";
import type { Maybe } from "@auaust/toolkit/types";

import { packages } from "#constants";
import { readJsonFile, resolveWithin } from "#foundation/filesystem/index";
import { validate } from "#foundation/options/index";
import { resolveBinary, spawnProcess } from "#foundation/processes/index";
import { baselineFile } from "#tools/jscpd/constants";
import { listScannedFiles } from "#tools/jscpd/operations/listScannedFiles";
import type { LoadedConfig } from "#project/config/index";
import type { Files } from "#types/Files";

const newClonesStatus = 1;

const reportFile = "jscpd-report.json";

const locationSchema = object({
  name: string(),
  start: number(),
  end: number(),
});

const reportSchema = object({
  duplicates: array(
    object({
      isNew: boolean(),
      firstFile: locationSchema,
      secondFile: locationSchema,
    }),
  ),
});

export async function reportClones(
  config: LoadedConfig,
  scope: { files: Files } | { since: string },
): Promise<Maybe<string>> {
  const { root } = config.context;

  const scanned = await listScannedFiles(config);

  if (
    "files" in scope &&
    !scope.files.some((file) => includes(scanned, file))
  ) {
    return;
  }

  const resources = await config.resolve("resources");

  const directory = resources.path("cache.jscpd");

  await mkdir(directory, { recursive: true });

  const range = "files" in scope
    ? ["--changed", "--baseline", resolveWithin(directory, baselineFile)]
    : ["--baseline-from-ref", scope.since];

  const { status, stdout, stderr, error } = await spawnProcess(
    process.execPath,
    [
      await resolveBinary(root, packages.jscpd, packages.jscpd),
      ...range,
      "--reporters",
      "json",
      "--output",
      directory,
      "--absolute",
      "--fail-on-new-clones=0",
      "--no-colors",
      "--no-tips",
      ...scanned,
    ],
    { cwd: root },
  );

  if (error !== undefined || (status !== 0 && status !== newClonesStatus)) {
    throw new Error(`jscpd failed:\n${error?.message ?? stdout + stderr}`);
  }

  const reportPath = resolveWithin(directory, reportFile);

  const {
    duplicates,
  } = validate(reportSchema, await readJsonFile(reportPath), reportPath);

  const lines = duplicates
    .filter(({ isNew }) => isNew)
    .map(({ firstFile, secondFile }) => {
      return [firstFile, secondFile].map(({ name, start, end }) => {
        return {
          file: relative(root, name),
          start,
          end,
        };
      });
    })
    .filter((locations) => {
      return (
        !("files" in scope) ||
        locations.some(({ file }) => includes(scope.files, file))
      );
    })
    .map((locations) => {
      return locations
        .map(({ file, start, end }) => `${file}:${start}-${end}`)
        .join(" ~ ");
    });

  return lines.length === 0 ? undefined : lines.join("\n");
}
