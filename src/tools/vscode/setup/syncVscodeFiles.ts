import { relative } from "node:path";
import { isDeepStrictEqual } from "node:util";

import { array, is, looseObject, optional, string } from "valibot";

import { isArray, isPlainObject } from "@auaust/toolkit";
import {
  every,
  filter,
  flatMap,
  includes,
  map,
  toArray,
  toReversed,
} from "@auaust/toolkit/array";
import {
  flatMap as flatMapIterable,
  map as mapIterable,
  unique,
} from "@auaust/toolkit/iterable";

import { resolveDataFile } from "#foundation/data/index";
import { toPosixPath, type Filesystem } from "#foundation/filesystem/index";
import { emptyObjectFile } from "#foundation/json/constants";
import {
  applyJsonEdits,
  flattenJsonObject,
  readJsonValue,
  writeJsonValue,
  type JsonEdit,
} from "#foundation/json/index";
import { validate } from "#foundation/options/index";
import { jsonIndentation } from "#project/format/constants";
import {
  eslintIntegration,
  extensionsFile,
  metadataSchemas,
  settingsFile,
} from "#tools/vscode/constants";
import { findIntegrations } from "#tools/vscode/utils/findIntegrations";
import type { LoadedConfig } from "#project/config/index";
import type { Integration } from "#tools/vscode/types/Integration";
import type { Directory } from "#types/Directory";
import type { File } from "#types/File";
import type { Glob } from "#types/Glob";

interface SettingEdit extends JsonEdit {
  identifier?: string;
}

const schemasLocation = ["json.schemas"];

const schemaAssociation = looseObject({
  fileMatch: array(string()),
  url: optional(string()),
});

function groupByUrl(
  schemas: ReadonlyMap<Glob, string>,
  matchers: Iterable<Glob>,
): Map<string, Glob[]> {
  const groups = new Map<string, Glob[]>();

  for (const matcher of matchers) {
    const url = schemas.get(matcher);

    if (url !== undefined) {
      groups.set(url, [...(groups.get(url) ?? []), matcher]);
    }
  }

  return groups;
}

function mergeSchemas(
  content: string,
  path: File,
  schemas: ReadonlyMap<Glob, string>,
): string {
  const existing = readJsonValue(content, path, schemasLocation);

  if (!isArray(existing)) {
    return applyJsonEdits(
      content,
      path,
      [
        {
          path: schemasLocation,
          value: toArray(
            mapIterable(
              groupByUrl(schemas, schemas.keys()),
              ([url, fileMatch]) => {
                return {
                  fileMatch,
                  url,
                };
              },
            ),
          ),
        },
      ],
      jsonIndentation,
    );
  }

  const placed = new Set<Glob>();

  const kept = map(existing, (entry) => {
    if (!is(schemaAssociation, entry)) {
      return;
    }

    return filter(entry.fileMatch, (matcher) => {
      const url = schemas.get(matcher);

      if (url === undefined) {
        return true;
      }

      if (url !== entry.url || placed.has(matcher)) {
        return false;
      }

      placed.add(matcher);

      return true;
    });
  });

  const missing = groupByUrl(
    schemas,
    filter(schemas.keys(), (matcher) => {
      return !placed.has(matcher);
    }),
  );

  let synced = content;

  const emptied: number[] = [];

  for (const [index, entry] of existing.entries()) {
    const fileMatch = kept[index];

    if (fileMatch === undefined || !is(schemaAssociation, entry)) {
      continue;
    }

    const joined = entry.url === undefined ? undefined : missing.get(entry.url);

    if (
      entry.url !== undefined &&
      joined !== undefined &&
      fileMatch.length > 0
    ) {
      fileMatch.push(...joined);

      missing.delete(entry.url);
    }

    if (fileMatch.length === 0 && entry.fileMatch.length > 0) {
      emptied.push(index);
    } else if (!isDeepStrictEqual(fileMatch, entry.fileMatch)) {
      synced = writeJsonValue(
        synced,
        path,
        [...schemasLocation, index, "fileMatch"],
        fileMatch,
        jsonIndentation,
      );
    }
  }

  for (const [url, fileMatch] of missing) {
    synced = writeJsonValue(
      synced,
      path,
      [...schemasLocation, -1],
      {
        fileMatch,
        url,
      },
      jsonIndentation,
      {
        isArrayInsertion: true,
      },
    );
  }

  for (const index of toReversed(emptied)) {
    synced = writeJsonValue(
      synced,
      path,
      [...schemasLocation, index],
      undefined,
      jsonIndentation,
    );
  }

  return synced;
}

// @debt addRecommendations repeats mergeSetting's array insertion; one array merge could serve both files.
function addRecommendations(
  content: string,
  path: File,
  extensions: readonly string[],
): string {
  const recommendations = validate(
    optional(array(string())),
    readJsonValue(content, path, ["recommendations"]),
    `${path} recommendations`,
  );

  let synced = content;

  for (const extension of extensions) {
    if (!includes(recommendations ?? [], extension)) {
      synced = writeJsonValue(
        synced,
        path,
        ["recommendations", -1],
        extension,
        jsonIndentation,
        { isArrayInsertion: true },
      );
    }
  }

  return synced;
}

function identify(entry: unknown, identifier: string | undefined): unknown {
  if (identifier === undefined) {
    return entry;
  }

  return isPlainObject(entry) ? entry[identifier] : undefined;
}

function mergeSetting(
  content: string,
  path: File,
  { path: location, value, identifier }: SettingEdit,
): string {
  const existing = readJsonValue(content, path, location);

  if (!isArray(value) || !isArray(existing)) {
    return applyJsonEdits(
      content,
      path,
      [{ path: location, value }],
      jsonIndentation,
    );
  }

  const identities = map(existing, (entry) => {
    return identify(entry, identifier);
  });

  let synced = content;

  for (const entry of value) {
    const identity = identify(entry, identifier);

    const isMissing = every(identities, (existingIdentity) => {
      return !isDeepStrictEqual(existingIdentity, identity);
    });

    if (isMissing) {
      synced = writeJsonValue(
        synced,
        path,
        [...location, -1],
        entry,
        jsonIndentation,
        { isArrayInsertion: true },
      );
    }
  }

  return synced;
}

async function isEnabled(
  filesystem: Filesystem,
  file: File,
  configured: boolean | undefined,
  requested: boolean,
): Promise<boolean> {
  if (configured === false) {
    return false;
  }

  return configured === true || requested || (await filesystem.exists(file));
}

async function loadEslintInfoRules(root: Directory): Promise<string[]> {
  const { loadInfoRules } = await import("#tools/eslint/index");

  return loadInfoRules(root);
}

function createSchemas(root: Directory): Map<Glob, string> {
  return new Map(
    mapIterable(metadataSchemas, ({ file, schema }): [Glob, string] => {
      return [
        `**/${file}`,
        `./${toPosixPath(relative(root, resolveDataFile(schema)))}`,
      ];
    }),
  );
}

async function createSettingsEdits(
  root: Directory,
  applicable: readonly Integration[],
): Promise<SettingEdit[]> {
  const infoRules = includes(applicable, eslintIntegration)
    ? await loadEslintInfoRules(root)
    : [];

  return flatMap(applicable, (integration): SettingEdit[] => {
    const edits = flattenJsonObject(integration.settings);

    if (integration !== eslintIntegration) {
      return edits;
    }

    return [
      ...edits,
      {
        path: ["eslint.rules.customizations"],
        identifier: "rule",
        value: map(infoRules, (rule) => {
          return {
            rule,
            severity: "info",
          };
        }),
      },
    ];
  });
}

/**
 * Merges the settings and extension recommendations of the project's tools into
 * `.vscode/settings.json` and `.vscode/extensions.json`. Each file is written
 * when its option is `true`, or with the option unset when its flag is set or
 * the file exists; never when the option is `false`.
 */
export async function syncVscodeFiles(
  config: LoadedConfig,
  {
    settings = false,
    extensions = false,
  }: {
    settings?: boolean;
    extensions?: boolean;
  } = {},
) {
  const [root, filesystem, resolve, environment, vscode] = await Promise.all([
    config.context.root,
    config.context.filesystem,
    config.context.path,
    config.resolve("environment"),
    config.resolve("vscode"),
  ]);

  const applicable = findIntegrations(environment.hasDependency);

  const recommendations = toArray(
    unique(
      flatMapIterable(applicable, (integration) => {
        return integration.extensions;
      }),
    ),
  );

  if (await isEnabled(filesystem, settingsFile, vscode.settings, settings)) {
    const path = resolve(settingsFile);

    const edits = await createSettingsEdits(root, applicable);

    let synced = (await filesystem.read(settingsFile)) ?? emptyObjectFile;

    for (const edit of edits) {
      synced = mergeSetting(synced, path, edit);
    }

    synced = mergeSchemas(synced, path, createSchemas(root));

    await filesystem.write(settingsFile, synced);
  }

  if (
    await isEnabled(filesystem, extensionsFile, vscode.extensions, extensions)
  ) {
    await filesystem.write(
      extensionsFile,
      addRecommendations(
        (await filesystem.read(extensionsFile)) ?? emptyObjectFile,
        resolve(extensionsFile),
        recommendations,
      ),
    );
  }
}
