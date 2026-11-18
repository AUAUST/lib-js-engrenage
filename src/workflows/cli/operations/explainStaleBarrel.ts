import { existsSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { basename, extname, relative } from "node:path";
import { fileURLToPath } from "node:url";

import { isString } from "@auaust/toolkit";

import {
  barrelDirective,
  barrelHeader,
  typescriptBlocks,
} from "#tools/typescript/constants";

const missingModuleCode = "ERR_MODULE_NOT_FOUND";

const importedFromPattern = / imported from (?<importer>.+)$/u;

const missingExportPattern = /^The requested module '(?<specifier>[^']+)' does not provide an export named '(?<name>[^']+)'$/u;

const importerPattern = /^(?<url>file:\/\/\S+?):\d+$/mu;

const specifierPattern = / from "(?<specifier>[^"]+)";$/u;

const barrelMarker = `${typescriptBlocks.open}@${barrelDirective} `;

const regeneration = "the barrel is loaded before `engrenage sync` can regenerate it, so fix it by hand";

function display(file: string): string {
  return relative(process.cwd(), file);
}

function readBarrel(file: string): string | undefined {
  if (!existsSync(file)) {
    return;
  }

  const content = readFileSync(file, "utf-8");

  const isBarrel = (
    content.startsWith(barrelHeader) ||
    content.split("\n").some((line) => line.startsWith(barrelMarker))
  );

  return isBarrel ? content : undefined;
}

function findListingLine(content: string, missing: string): string | undefined {
  const name = basename(missing, extname(missing));

  return content.split("\n").find((line) => {
    const specifier = specifierPattern.exec(line)?.groups?.specifier;

    return (
      specifier !== undefined &&
      basename(specifier, extname(specifier)) === name
    );
  });
}

function explainMissingModule(error: Error): string | undefined {
  const importer = importedFromPattern.exec(error.message)?.groups?.importer;

  if (
    !("code" in error && error.code === missingModuleCode) ||
    !("url" in error && isString(error.url)) ||
    importer === undefined
  ) {
    return;
  }

  const content = readBarrel(importer);

  if (content === undefined) {
    return;
  }

  const missing = fileURLToPath(error.url);
  const line = findListingLine(content, missing);
  const listing = line === undefined ? "its line" : `\`${line}\``;

  return `The barrel ${display(importer)} lists ${display(missing)}, which does not exist; ${regeneration}: delete ${listing} or point it to the module's new path, then run \`engrenage sync\`.`;
}

function explainMissingExport(error: Error): string | undefined {
  const {
    specifier,
    name,
  } = missingExportPattern.exec(error.message)?.groups ?? {};

  const url = importerPattern.exec(error.stack ?? "")?.groups?.url;

  if (specifier === undefined || name === undefined || url === undefined) {
    return;
  }

  const importer = fileURLToPath(url);

  let barrel: string;

  try {
    barrel = createRequire(importer).resolve(specifier);
  } catch {
    return;
  }

  if (readBarrel(barrel) === undefined) {
    return;
  }

  return `${display(importer)} imports \`${name}\` from "${specifier}", but the barrel ${display(barrel)} does not export it yet; ${regeneration}: add a line exporting \`${name}\` to ${display(barrel)}, written like its other lines, then run \`engrenage sync\`.`;
}

/**
 * Explains a module-load failure caused by a stale generated barrel, which
 * `engrenage sync` cannot repair because loading the barrel fails first.
 *
 * @returns The hand fix, or `undefined` when the failure is not a stale barrel.
 */
export function explainStaleBarrel(error: unknown): string | undefined {
  if (!(error instanceof Error)) {
    return;
  }

  return explainMissingModule(error) ?? explainMissingExport(error);
}
