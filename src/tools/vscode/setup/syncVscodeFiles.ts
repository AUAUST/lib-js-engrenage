import { array, optional, string } from "valibot";

import {
  deduplicate,
  flatMap,
  includes,
  map,
} from "@auaust/primitive-kit/arrays";

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
import { environmentSection } from "#project/package/index";
import { vscodeSection } from "#tools/vscode/config/sections/vscodeSection";
import {
  eslintIntegration,
  extensionsFile,
  settingsFile,
} from "#tools/vscode/constants";
import { findIntegrations } from "#tools/vscode/utils/findIntegrations";
import type { Filesystem } from "#foundation/filesystem/index";
import type { LoadedConfig } from "#project/config/index";
import type { Integration } from "#tools/vscode/types/Integration";
import type { Directory } from "#types/Directory";
import type { File } from "#types/File";

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

// @debt `auaust/no-dynamic-import` forbids this lazy load, which keeps the ESLint engine out of every config load, so the rule is disabled on it until it allows heavy dependencies on rare paths (#221).
async function loadEslintInfoRules(root: Directory): Promise<string[]> {
  // eslint-disable-next-line auaust/no-dynamic-import
  const { loadInfoRules } = await import("#tools/eslint/index");

  return loadInfoRules(root);
}

async function createSettingsEdits(
  root: Directory,
  applicable: readonly Integration[],
): Promise<JsonEdit[]> {
  const infoRules = includes(applicable, eslintIntegration)
    ? await loadEslintInfoRules(root)
    : [];

  return flatMap(applicable, (integration) => {
    const edits = flattenJsonObject(integration.settings);

    if (integration !== eslintIntegration) {
      return edits;
    }

    return [
      ...edits,
      {
        path: ["eslint.rules.customizations"],
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
    config.resolve(environmentSection),
    config.resolve(vscodeSection),
  ]);

  const applicable = findIntegrations(environment.hasDependency);

  const recommendations = deduplicate(
    flatMap(applicable, (integration) => {
      return integration.extensions;
    }),
  );

  if (await isEnabled(filesystem, settingsFile, vscode.settings, settings)) {
    await filesystem.write(
      settingsFile,
      applyJsonEdits(
        (await filesystem.read(settingsFile)) ?? emptyObjectFile,
        resolve(settingsFile),
        await createSettingsEdits(root, applicable),
        jsonIndentation,
      ),
    );
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
