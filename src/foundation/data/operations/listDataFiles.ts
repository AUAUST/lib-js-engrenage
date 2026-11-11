import { readdir, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

import { looseObject, optional, record, string, unknown } from "valibot";

import { isString } from "@auaust/toolkit/isString";

import { validate } from "#foundation/options/index";
import type { File } from "#types/File";

const manifestSchema = looseObject({
  name: string(),
  exports: optional(record(string(), unknown())),
});

function splitPattern(pattern: string, owner: string): [string, string] {
  const star = pattern.indexOf("*");

  if (star === -1 || star !== pattern.lastIndexOf("*")) {
    throw new Error(`${owner}: "${pattern}" must hold exactly one "*"`);
  }

  return [pattern.slice(0, star), pattern.slice(star + 1)];
}

export async function listDataFiles(
  root: URL,
  subpath: `./${string}*${string}`,
): Promise<readonly { readonly file: File; readonly specifier: string }[]> {
  const manifestUrl = new URL("package.json", root);
  const manifestFile = fileURLToPath(manifestUrl);

  const { name, exports } = validate(
    manifestSchema,
    JSON.parse(await readFile(manifestUrl, "utf-8")),
    manifestFile,
  );

  const target = exports?.[subpath];

  if (target === undefined) {
    return [];
  }

  if (!isString(target)) {
    throw new Error(
      `${manifestFile}: the "${subpath}" export must map to one path pattern`,
    );
  }

  const [subpathPrefix, subpathSuffix] = splitPattern(subpath, manifestFile);
  const [targetPrefix, targetSuffix] = splitPattern(target, manifestFile);

  const directoryUrl = new URL(targetPrefix, root);

  if (!targetPrefix.endsWith("/") || !subpathPrefix.endsWith("/")) {
    throw new Error(
      `${manifestFile}: the "${subpath}" export must match whole file names`,
    );
  }

  const entries = await readdir(directoryUrl, { withFileTypes: true });

  return entries
    .filter((entry) => {
      return entry.isFile() && entry.name.endsWith(targetSuffix);
    })
    .map(({ name: file }) => {
      const stem = file.slice(0, file.length - targetSuffix.length);

      return {
        file: fileURLToPath(new URL(file, directoryUrl)),
        specifier: `${name}/${subpathPrefix.slice(2)}${stem}${subpathSuffix}`,
      };
    });
}
