import { relative } from "node:path";
import { isDeepStrictEqual } from "node:util";

import { array, optional, string } from "valibot";

import {
  deduplicate,
  every,
  flatMap,
  includes,
  map,
} from "@auaust/primitive-kit/arrays";
import { isArray } from "@auaust/toolkit/isArray";
import { isPlainObject } from "@auaust/toolkit/isPlainObject";

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

interface SettingEdit extends JsonEdit {
  identifier?: string;
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

async function createSettingsEdits(
  root: Directory,
  applicable: readonly Integration[],
): Promise<SettingEdit[]> {
  const infoRules = includes(applicable, eslintIntegration)
    ? await loadEslintInfoRules(root)
    : [];

  const schemas: SettingEdit = {
    path: ["json.schemas"],
    identifier: "url",
    value: map(metadataSchemas, ({ file, schema }) => {
      return {
        fileMatch: [`**/${file}`],
        url: `./${toPosixPath(relative(root, resolveDataFile(schema)))}`,
      };
    }),
  };

  const integrationEdits = flatMap(applicable, (integration): SettingEdit[] => {
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

  return [...integrationEdits, schemas];
}

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

  const recommendations = deduplicate(
    flatMap(applicable, (integration) => {
      return integration.extensions;
    }),
  );

  if (await isEnabled(filesystem, settingsFile, vscode.settings, settings)) {
    const path = resolve(settingsFile);

    const edits = await createSettingsEdits(root, applicable);

    let synced = (await filesystem.read(settingsFile)) ?? emptyObjectFile;

    for (const edit of edits) {
      synced = mergeSetting(synced, path, edit);
    }

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
